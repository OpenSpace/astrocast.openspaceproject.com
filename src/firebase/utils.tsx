import {
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider
} from 'firebase/auth';

import { FacebookIcon, GithubIcon, GoogleIcon, TwitterIcon } from '@/icons/icons';

import type { ProviderKey } from './types';

export const supportedProviders = [
  GoogleAuthProvider.PROVIDER_ID,
  FacebookAuthProvider.PROVIDER_ID,
  GithubAuthProvider.PROVIDER_ID,
  TwitterAuthProvider.PROVIDER_ID
] as const;

export function providerIcon(providerKey: ProviderKey) {
  switch (providerKey) {
    case GoogleAuthProvider.PROVIDER_ID:
      return <GoogleIcon />;
    case FacebookAuthProvider.PROVIDER_ID:
      return <FacebookIcon />;
    case GithubAuthProvider.PROVIDER_ID:
      return <GithubIcon />;
    case TwitterAuthProvider.PROVIDER_ID:
      return <TwitterIcon />;
    default:
      throw new Error(`Unsupported provider: ${providerKey}`);
  }
}

/**
 * Return the OAuth provider object corresponding to the given provider key.
 * @param providerKey The provider key, which should be one of the supported provider IDs.
 * @returns The corresponding OAuth provider object.
 */
export function getProvider(providerKey: ProviderKey) {
  switch (providerKey) {
    case GoogleAuthProvider.PROVIDER_ID: {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      return provider;
    }
    case FacebookAuthProvider.PROVIDER_ID:
      return new FacebookAuthProvider();
    case GithubAuthProvider.PROVIDER_ID:
      return new GithubAuthProvider();
    case TwitterAuthProvider.PROVIDER_ID:
      return new TwitterAuthProvider();
    default:
      throw new Error(`Unsupported provider: ${providerKey}`);
  }
}
