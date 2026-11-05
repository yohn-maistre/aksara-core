import {useWorkspace} from "./state";
import {Mark} from "./shared";
export function AksaraLauncher(){const {navigate,page}=useWorkspace();return <button className="aksara-launcher" aria-label="Ask PRIVATE" title="Open private conversation" aria-expanded={page==="Ask"} onClick={()=>navigate("Ask")}><Mark/><span className="launcher-label">Talk to Aksara</span></button>;}
