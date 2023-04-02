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
      <Text.Eyebrow>use Red Background for deleted Text</Text.Eyebrow>
      <Switch
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
