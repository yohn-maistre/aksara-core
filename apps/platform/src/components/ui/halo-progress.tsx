// Adapted from Cult UI halo-progress d71b142, MIT. Flat Aksara role tokens;
// real values only, or a labeled indeterminate state. No decorative rim/glow.
import {useMemo,type ReactNode} from 'react';
import {Progress} from '@base-ui/react/progress';
import {motion,useReducedMotion} from 'motion/react';
import {cn} from '@/lib/utils';
export interface HaloProgressProps extends Omit<Progress.Root.Props,'children'>{label?:ReactNode;showValue?:boolean;translucent?:boolean;trackClassName?:string;indicatorClassName?:string}
export function HaloProgress({className,label,showValue=false,translucent:_translucent=false,trackClassName,indicatorClassName,value,min=0,max=100,...props}:HaloProgressProps){
 const reduced=useReducedMotion();const indeterminate=value===null;
 const fraction=useMemo(()=>value===null||!Number.isFinite(value)||max<=min?0:Math.min(1,Math.max(0,(value-min)/(max-min))),[value,min,max]);
 return <Progress.Root {...props} value={value} min={min} max={max} className={cn('aksara-progress',className)}>{(label||showValue)&&<div className="progress-label">{label&&<Progress.Label>{label}</Progress.Label>}{showValue&&!indeterminate&&<Progress.Value/>}</div>}<Progress.Track className={cn('progress-track',trackClassName)}>{indeterminate?<motion.div aria-hidden className="progress-indeterminate" animate={reduced?{x:'0%'}:{x:['-110%','310%']}} transition={{duration:reduced?0:1.8,ease:'easeInOut',repeat:reduced?0:Infinity}}/>:<motion.div aria-hidden className={cn('progress-fill',indicatorClassName)} initial={false} animate={{scaleX:fraction}} transition={{duration:reduced?0:.2}}/>}</Progress.Track></Progress.Root>
}
