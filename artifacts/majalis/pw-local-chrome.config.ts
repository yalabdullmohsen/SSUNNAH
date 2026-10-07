import base from "./playwright.config";
export default { ...base, reporter: "line", projects: [{ name: "desktop", use: { ...base.projects![0].use, channel: "chrome" } }] };
