/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { types } from "replugged";

const patches: types.PlaintextPatch[] = [
  {
    // MessageStore
    // Module 171447
    find: '"MessageStore"',
    replacements: [
      {
        // Add deleted=true to all target messages in the MESSAGE_DELETE event
        match:
          /function (\w+)\((\w)\){.{10,40}(\w+\.\w+)\.getOrCreate.{30,50}\.revealedMessageId===.+?\.delete\(\w+\)}/,
        replace:
          "function $1($2){" +
          "   var cache = $3.getOrCreate($2.channelId);" +
          "   cache = window.rml.handleDelete(cache, $2, false);" +
          "   $3.commit(cache);" +
          "}",
      },
      {
        // Add deleted=true to all target messages in the MESSAGE_DELETE_BULK event
        match:
          /function (\w+)\((\w)\){.{10,40}(\w+\.\w+)\.getOrCreate.{20,40}\.removeMany.+?\.delete\(e\)}\)}/,
        replace:
          "function $1($2){" +
          "   var cache = $3.getOrCreate($2.channelId);" +
          "   cache = window.rml.handleDelete(cache, $2, true);" +
          "   $3.commit(cache);" +
          "}",
      },
      {
        // Add current cached content + new edit time to cached message's editHistory
        match: /(function \w+\((\w)\){let \w+=\w+\.message\.id.{70,90})\.update\((\w)/,
        replace:
          "$1" +
          ".update($3,m =>" +
          "   (($2.message.flags & 64) === 64 || (window.rml.settings.get('ignoreBots', false) && $2.message.author?.bot) || (window.rml.settings.get('ignoreSelf', false) && $2.message.author?.id === replugged.common.users.getCurrentUser().id)) ? m :" +
          "   $2.message.content !== m.editHistory?.[0]?.content && $2.message.content !== m.content ?" +
          "       m.set('editHistory',[...(m.editHistory || []), window.rml.makeEdit($2.message, m)]) :" +
          "       m" +
          ")" +
          ".update($3",
      },
    ],
  },
  {
    // Message domain model
    // Module 451
    find: "isSystemDM(){",
    replacements: [
      {
        match: /(\w*?)\.customRenderedContent=(\w*?)\.customRenderedContent,/,
        replace:
          "$1.customRenderedContent = $2.customRenderedContent," +
          "$1.deleted = $2.deleted || false," +
          "$1.editHistory = $2.editHistory || [],",
      },
    ],
  },
  {
    // Updated message transformer(?)
    // Module 819525
    find: "THREAD_STARTER_MESSAGE?null===",
    replacements: [
      // {
      //     // DEBUG: Log the params of the target function to the patch below
      //     match: /function N\(e,t\){/,
      //     replace: "function L(e,t){console.log('pre-transform', e, t);"
      // },
      {
        // Pass through editHistory & deleted & original attachments to the "edited message" transformer
        match: /interactionData:(\w)\.interactionData/,
        replace:
          "interactionData:$1.interactionData," +
          "deleted:$1.deleted," +
          "editHistory:$1.editHistory," +
          "attachments:$1.attachments",
      },

      // {
      //     // DEBUG: Log the params of the target function to the patch below
      //     match: /function R\(e\){/,
      //     replace: "function R(e){console.log('after-edit-transform', arguments);"
      // },
      {
        // Construct new edited message and add editHistory & deleted (ref above)
        // Pass in custom data to attachment parser to mark attachments deleted as well
        match: /attachments:(\w{1,2})\((\w)\)/,
        replace:
          "attachments: $1((() => {" +
          " if (($2.flags & 64) === 64 || (window.rml.settings.get('ignoreBots', false) && $2.author?.bot) || (window.rml.settings.get('ignoreSelf', false) && $2.author?.id === replugged.common.users.getCurrentUser().id)) return $2; " +
          "  let old = arguments[1]?.attachments;" +
          "   if (!old) return $2;" +
          "   let new_ = $2.attachments?.map(a => a.id) ?? [];" +
          "   let diff = old.filter(a => !new_.includes(a.id));" +
          "   diff.forEach(a => a.deleted = true);" +
          "   $2.attachments = [...diff, ...$2.attachments];" +
          "   return $2;" +
          "})())," +
          "deleted: arguments[1]?.deleted," +
          "editHistory: arguments[1]?.editHistory",
      },
      {
        // Preserve deleted attribute on attachments
        match: /(\((\w)\){return null==\2\.attachments.+?\.(\w+),)spoiler:/,
        // eslint-disable-next-line no-useless-concat
        replace: "$1deleted: arguments[0]?.deleted || $2.deleted," + "spoiler:",
      },
    ],
  },
  {
    // Attachment renderer
    // Module 96063
    find: ".downloadHoverButtonIcon",
    replacements: [
      {
        match: /className:\w,item:\w,/,
        replace: (prefix) => `${prefix}item,`,
      },
      {
        match: /,\[.\.hiddenSpoiler\]/,
        replace: (suffix) =>
          `,"messagelogger-deleted-attachment":item?.originalItem?.deleted${suffix}`,
      },
    ],
  },
  {
    // Base message component renderer
    // Module 748241
    find: "Message must not be a thread starter message",
    replacements: [
      {
        // Append messagelogger-deleted to classNames if deleted
        match: /\)\("li",\{(.+?),className:/,
        replace:
          ')("li",{$1,className:(arguments[0].message.deleted ? "messagelogger-deleted " : "")+',
      },
    ],
  },
  {
    // Message content renderer
    // Module 43016
    find: ".editedTimestamp&&",
    replacements: [
      {
        // Render editHistory in the deepest div for message content
        match: /(\)\("div",\{id:.+?children:\[)/,
        replace:
          "$1 (arguments[0]?.message?.editHistory?.length > 0 ? arguments[0].message.editHistory.map(edit => window.rml.renderEdit(edit)) : null), ",
      },
    ],
  },
  {
    // ReferencedMessageStore
    // Module 778667
    find: '"ReferencedMessageStore"',
    replacements: [
      {
        match: /MESSAGE_DELETE:\w+,/,
        replace: "MESSAGE_DELETE:function(){},",
      },
      {
        match: /MESSAGE_DELETE_BULK:\w+,/,
        replace: "MESSAGE_DELETE_BULK:function(){},",
      },
    ],
  },
  {
    // Message context base menu
    // Module 600300
    find: 'id:"remove-reactions"',
    replacements: [
      {
        // Remove the first section if message is deleted
        match: /children:(\[""===.+?\])/,
        replace: "children:arguments[0].message.deleted?[]:$1",
      },
    ],
  },
];

export default patches;
