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

import { common, components, types, webpack } from "replugged";
import { MLSettings, initSettings } from "./utils";
import { stylesType } from "./messageLogger";
import moment from "moment";

const { ErrorBoundary } = components;
const { users } = common;

//@ts-expect-error local file
import("./css/messageLogger.css");
//@ts-expect-error local file
import("./css/deleteStyleOverlay.css");
//@ts-expect-error local file
import("./css/deleteStyleText.css");

const styles: types.ModuleExports & stylesType = await webpack.waitForModule(
  webpack.filters.byProps("edited", "communicationDisabled", "isSystemMessage"),
);

//const moment = webpack.waitForModule(webpack.filters.byProps("parseTwoDigitYear"));

function renderEdit(edit: { timestamp: any; content: string }) {
  return (
    <ErrorBoundary noop>
      <div className="messagelogger-edited">
        {common.parser.parse(edit.content)}
        <span className={styles.edited}> (edited)</span>
      </div>
    </ErrorBoundary>
  );
}

function makeEdit(newMessage: any, oldMessage: any): any {
  const timestamp = moment?.call(newMessage.edited_timestamp);
  return {
    timestamp,
    content: oldMessage.content,
  };
}

function handleDelete(
  cache: any,
  data: { ids: string[]; id: string; mlDeleted?: boolean },
  isBulk: boolean,
) {
  try {
    if (cache == null || (!isBulk && !cache.has(data.id))) return cache;

    const { ignoreSelf, ignoreBots } = MLSettings.all();
    const myId = users.getCurrentUser().id;

    function mutate(id: string) {
      const msg = cache.get(id);
      if (!msg) return;

      const EPHEMERAL = 64;
      const shouldIgnore =
        data.mlDeleted ||
        (msg.flags & EPHEMERAL) === EPHEMERAL ||
        (ignoreBots && msg.author?.bot) ||
        (ignoreSelf && msg.author?.id === myId);

      if (shouldIgnore) {
        cache = cache.remove(id);
      } else {
        cache = cache.update(
          id,
          (m: {
            set: (
              arg0: string,
              arg1: boolean,
            ) => { (): any; new (): any; set: { (arg0: string, arg1: any): any; new (): any } };
            attachments: any[];
          }) =>
            m.set("deleted", true).set(
              "attachments",
              // eslint-disable-next-line no-return-assign, no-sequences
              m.attachments.map((a) => ((a.deleted = true), a)),
            ),
        );
      }
    }

    if (isBulk) {
      data.ids.forEach(mutate);
    } else mutate(data.id);
  } catch (e) {
    console.error("MessageLogger: ", e);
  }
  return cache;
}

export async function start(): Promise<void> {
  const settings = await initSettings();
  // @ts-expect-error adding to window
  window.rml = {
    handleDelete,
    makeEdit,
    renderEdit,
    settings,
  };
}

export function stop(): void {}

export { Settings } from "./Settings";
