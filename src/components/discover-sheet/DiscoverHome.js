import React from 'react';
import useExperimentalFlag, { PROFILES } from '../../config/experimentalHooks';
import BottomSpacer from './BottomSpacer';
import DPICard from './DPICard';
import ENSCreateProfileCard from './ENSCreateProfileCard';
import ENSSearchCard from './ENSSearchCard';
import GasCard from './GasCard';
import Lists from './ListsSection';
import PulseIndex from './PulseIndexSection';
import TopMoversSection from './TopMoversSection';
import UniswapPools from './UniswapPoolsSection';
import { isTestnetNetwork } from '@/handlers/web3';
import { Columns, Inset, Stack } from '@/design-system';
import { useAccountAsset, useAccountSettings } from '@/hooks';
import { ETH_ADDRESS } from '@/references';
import { isZero } from '@/helpers/utilities';

export default function DiscoverHome() {
  const { accountAddress, network } = useAccountSettings();
  const accountAsset = useAccountAsset(ETH_ADDRESS);
  const profilesEnabled = useExperimentalFlag(PROFILES);
  const testNetwork = isTestnetNetwork(network);
  return (
    <React.Fragment>
      <Inset top={{ custom: 16 }}>
        <Stack space="30px (Deprecated)">
          {profilesEnabled &&
          !testNetwork &&
          !isZero(accountAsset.balance.amount) ? (
            <Inset horizontal={ios && '19px (Deprecated)'}>
              <Stack space={ios && '19px (Deprecated)'}>
                <Columns space={ios && '19px (Deprecated)'}>
                  <GasCard />
                  <ENSSearchCard />
                </Columns>
                <ENSCreateProfileCard />
                <DPICard />
              </Stack>
            </Inset>
          ) : (
            <Stack space={{ custom: 21 }}>
              <TopMoversSection />
              <PulseIndex />
            </Stack>
          )}
          <Stack space="30px (Deprecated)">
            <Lists />
            {accountAddress ? <UniswapPools /> : null}
          </Stack>
        </Stack>
      </Inset>
      <BottomSpacer />
    </React.Fragment>
  );
}
