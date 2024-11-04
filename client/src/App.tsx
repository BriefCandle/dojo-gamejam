import { useEffect, useState } from "react";
import {
  useComponentValue,
  useEntityQuery,
  useQuerySync,
} from "@dojoengine/react";
import { Entity, getComponentValue, Has, HasValue } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";

import { useDojo } from "./dojo/useDojo";
import { hexToString, stringToHex } from "viem";
import useHotkeys from "./hooks/useHotKeys";
import { OVERLAY } from "./constants";
import { BurnerWallet } from "./components/BurnerWallet";
import { Heroes } from "./components/Hero";

function App() {
  const {
    clientComponents: { ToggledOn, HeroSpecs, Hero },
    toriiClient,
    contractComponents,
    client,
    systemCalls,
    account,
  } = useDojo();
  useHotkeys();
  const [isDeployed, setIsDeployed] = useState(false);

  useEffect(() => {
    if (account) {
      account.checkIsDeployed(account.account.address).then((res) => {
        setIsDeployed(res);
      });
    }
  }, [account]);

  // const entityId = getEntityIdFromKeys([
  //   BigInt(account?.account.address),
  // ]) as Entity;

  const toggled = useComponentValue(ToggledOn, OVERLAY)?.value ?? false;
  // overlay must be on when not deployed
  const isOverlay = !isDeployed || toggled;

  // const specsEntities = useEntityQuery([
  //   HasValue(HeroSpecs, { heroType: "0x12121221" as Entity }),
  // ]);
  // console.log("HeroSpecses", specsEntities);

  // const heroes = useEntityQuery([Has(Hero)]);
  // console.log("Hosts", hosts);

  return (
    <div className="absolute h-full w-full pointer-events-none">
      {isOverlay && <BurnerWallet />}
      {!isOverlay && <Heroes />}
    </div>
  );
}

export default App;
