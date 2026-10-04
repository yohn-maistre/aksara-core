import sys
from pathlib import Path
import tempfile
import time
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'python'))
from aksara_device_sdk import DeviceSimulator, ProtocolError


class DeviceConformance(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = str(Path(self.tmp.name) / 'controller.sqlite')
        self.sim = DeviceSimulator(self.path)

    def tearDown(self):
        self.sim.db.close()
        self.tmp.cleanup()

    def command(self, ident='command-1', **args):
        return {'id': ident, 'args': {'device': 'presence', 'state': 'working', 'controller_generation': self.sim.state()['generation'], **args}, 'expires_at': int(time.time()) + 60, 'generation': 1}

    def test_privacy_and_capture_transfer(self):
        self.assertTrue(self.sim.state()['privacy'])
        with self.assertRaises(ProtocolError):
            self.sim.sdk_operation('capture.start', source='controller', expires_at=int(time.time()) + 30)
        self.sim.physical('privacy')
        self.sim.sdk_operation('capture.start', source='controller', expires_at=int(time.time()) + 30)
        with self.assertRaises(ProtocolError):
            self.sim.sdk_operation('capture.start', source='card', expires_at=int(time.time()) + 30)
        self.sim.sdk_operation('capture.stop')
        self.sim.sdk_operation('capture.start', source='card', expires_at=int(time.time()) + 30)
        self.sim.physical('privacy')
        self.assertIsNone(self.sim.state()['capture'])

    def test_capture_expiry_survives_restart(self):
        self.sim.physical('privacy')
        self.sim.sdk_operation('capture.start', source='controller', expires_at=int(time.time()) + 20)
        state = self.sim.state()
        state['capture_until'] = int(time.time()) - 1
        self.sim._save(state)
        self.sim.db.commit()
        self.sim.db.close()
        self.sim = DeviceSimulator(self.path)
        self.assertIsNone(self.sim.state()['capture'])

    def test_stop_fences_queued_commands_after_release(self):
        old = self.command()
        self.sim.physical('stop')
        with self.assertRaises(ProtocolError):
            self.sim.command(old)
        self.sim.physical('release')
        with self.assertRaises(ProtocolError):
            self.sim.command(old)
        self.assertEqual(self.sim.command(self.command('fresh'))['outcome'], 'VERIFIED')
        with self.assertRaises(ProtocolError):
            self.sim.sdk_operation('observation.act', generation=1)

    def test_destination_deduplication_and_conflict(self):
        command = self.command()
        receipt = self.sim.command(command)
        command['expires_at'] = 0
        self.assertEqual(self.sim.command(command), receipt)
        command['args']['state'] = 'success'
        with self.assertRaises(ProtocolError):
            self.sim.command(command)
        self.assertEqual(self.sim.db.execute('SELECT count(*) FROM receipts').fetchone()[0], 1)

    def test_expired_and_unpaired_commands_are_denied(self):
        command = self.command()
        command['expires_at'] = int(time.time()) - 1
        with self.assertRaises(ProtocolError):
            self.sim.command(command)
        self.sim.sdk_operation('device.revoke', device='presence')
        with self.assertRaises(ProtocolError):
            self.sim.command(self.command())

    def test_linux_loss_clears_capture_but_wan_loss_does_not_disable_local_interlock(self):
        self.sim.physical('privacy')
        self.sim.sdk_operation('capture.start', source='controller', expires_at=int(time.time()) + 30)
        self.sim.physical('wan')
        self.sim.command(self.command())
        self.sim.physical('linux')
        self.assertIsNone(self.sim.state()['capture'])
        with self.assertRaises(ProtocolError):
            self.sim.command(self.command('offline'))
        self.sim.physical('stop')
        self.assertTrue(self.sim.state()['stopped'])

    def test_persistent_frame_rejects_private_or_sensitive_payloads(self):
        for audience, data_class in [('private', 'ordinary'), ('public', 'secret')]:
            with self.assertRaises(ProtocolError):
                self.sim.sdk_operation('frame.compose', audience=audience, data_class=data_class, state='working')
        self.sim.sdk_operation('frame.compose', audience='public', data_class='ordinary', state='working')

    def test_queue_and_capture_bounds(self):
        for _ in range(100):
            self.sim.sdk_operation('queue.enqueue', item='bounded')
        with self.assertRaises(ProtocolError):
            self.sim.sdk_operation('queue.enqueue', item='overflow')
        self.sim.physical('privacy')
        with self.assertRaises(ProtocolError):
            self.sim.sdk_operation('capture.start', source='controller', expires_at=int(time.time()) + 3600)

    def test_ota_fixture_rejection_and_rollback(self):
        with self.assertRaises(ProtocolError):
            self.sim.sdk_operation('ota.test', signature_valid=False, healthy=True)
        self.assertEqual(self.sim.sdk_operation('ota.test', signature_valid=True, healthy=False)['ota_slot'], 'A')
        self.assertEqual(self.sim.sdk_operation('ota.test', signature_valid=True, healthy=True)['ota_slot'], 'B')


if __name__ == '__main__':
    unittest.main()
