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

import { common, components } from "replugged";
import { MLSettings } from "./utils";

const { React } = common;
const { Switch, Text } = components;

export function Settings() {
  let [useOverlay, setUseOverlay] = React.useState(MLSettings.get("useOverlay", false));
  let [ignoreSelf, setIgnoreSelf] = React.useState(MLSettings.get("ignoreSelf", false));
  let [ignoreBots, setIgnoreBots] = React.useState(MLSettings.get("ignoreBots", false));

  return (
    <>
      <Text.Eyebrow>use Red Background for deleted Text (temporarily disabled)</Text.Eyebrow>
      <Switch
        disabled={true}
        checked={useOverlay}
        onChange={(e) => {
          setUseOverlay(e);
          MLSettings.set("useOverlay", e);
        }}></Switch>
      <Text.Eyebrow style={{ marginTop: "5px", marginBottom: "5px" }}>
        Ignore own Messages
      </Text.Eyebrow>
      <Switch
        checked={ignoreSelf}
        onChange={(e) => {
          setIgnoreSelf(e);
          MLSettings.set("ignoreSelf", e);
        }}></Switch>
      <Text.Eyebrow style={{ marginTop: "5px", marginBottom: "5px" }}>
        Ignore Bot Messages
      </Text.Eyebrow>
      <Switch
        checked={ignoreBots}
        onChange={(e) => {
          setIgnoreBots(e);
          MLSettings.set("ignoreBots", e);
        }}></Switch>
    </>
  );
}
