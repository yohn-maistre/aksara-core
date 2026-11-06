import {useWorkspace} from "./state";
import {Mark} from "./shared";
export function AksaraLauncher(){const {assistantPanelOpen,setAssistantPanelOpen}=useWorkspace();return <button className="aksara-launcher" aria-label="Open private Aksara" title="Aksara · private conversation" aria-expanded={assistantPanelOpen} aria-controls="private-aksara" onClick={()=>setAssistantPanelOpen(!assistantPanelOpen)}><Mark/><span className="launcher-label">Aksara<small>Private conversation</small></span></button>;}
