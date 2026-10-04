import { KernelClient, PiResidentRuntime } from './adapter.mjs';

const workId = process.argv[2];
if (!workId || !process.env.AKSARA_TOKEN || !process.env.AKSARA_LANE) {
  console.error('Usage: AKSARA_TOKEN=... AKSARA_LANE=... npm run worker -- work_ID'); process.exit(2);
}
process.umask(0o077);
const client = new KernelClient({url:process.env.AKSARA_URL,token:process.env.AKSARA_TOKEN,lane:process.env.AKSARA_LANE});
const work = await client.call('thread',undefined,{id:workId});
const runtime = await PiResidentRuntime.open({
  path:process.env.AKSARA_RUNTIME_DB || `.aksara/pi-${workId}.sqlite`,client,
  onCheckpoint: async phase => {
    if(process.env.AKSARA_PI_FAULT===phase) process.kill(process.pid,'SIGKILL');
  },
});
try {
  const id = await runtime.submit({work_id:work.id,revision:work.revision,generation:work.generation});
  const outcome = await runtime.wait(id);
  console.log(JSON.stringify({runtime_ref:`pi:${id}`,outcome:outcome.state.outcome}));
  if(outcome.state.outcome.status!=='completed') process.exitCode=1;
} finally { await runtime.close(); }
