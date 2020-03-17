import test from 'ava';
import sinon from 'sinon';
import fetch from 'node-fetch';
import { createMagicAdminSDK } from '../../../lib/factories';
import { VALID_DIDT, API_KEY } from '../../../lib/constants';
import { createApiKeyMissingError, MagicAdminSDKError } from '../../../../src/admin-sdk/core/sdk-exceptions';

test('#01: Successfully POSTs to logout endpoint via DIDT', async t => {
  const sdk = createMagicAdminSDK('https://example.com');

  const fetchStub = sinon.stub();
  (fetch as any) = fetchStub;

  await t.notThrowsAsync(sdk.users.logoutByIssuer('did:ethr:0x1234'));

  const fetchArguments = fetchStub.args[0];
  t.deepEqual(fetchArguments, [
    'https://example.com/v1/admin/auth/user/logout',
    {
      method: 'POST',
      headers: { 'X-Magic-Secret-key': API_KEY },
      body: '{"publicaddress":"0x1234"}',
    },
  ]);
});

test('#02: Fails POST if API key is missing', async t => {
  const sdk = createMagicAdminSDK('https://example.com');

  const fetchStub = sinon.stub();
  (fetch as any) = fetchStub;

  const expectedError = createApiKeyMissingError();

  (sdk as any).secretApiKey = undefined;

  const error: MagicAdminSDKError = await t.throwsAsync(sdk.users.logoutByIssuer('did:ethr:0x1234'));

  t.false(fetchStub.called);
  t.is(error.code, expectedError.code);
  t.is(error.message, expectedError.message);
});