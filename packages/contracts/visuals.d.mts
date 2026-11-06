import {z} from 'zod/v4';
export type Visual = {protocol:'aksara.visual/1';kind:'diagram';nodes:{id:string;label:string;x:number;y:number;shape:'rectangle'|'ellipse'|'diamond'}[];edges:{from:string;to:string;label?:string}[]}|{protocol:'aksara.visual/1';kind:'bar-chart';unit:string;data:{label:string;value:number}[]};
export const VisualSpec:z.ZodType<Visual>;
export function parseVisual(text:string):Visual|null;
