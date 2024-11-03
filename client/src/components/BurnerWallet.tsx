import { useComponentValue } from "@dojoengine/react";
import {
  Entity,
  getComponentValue,
  Has,
  removeComponent,
  runQuery,
  setComponent,
} from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useEffect, useState } from "react";
import { useDojo } from "../dojo/useDojo";
import { Hex, hexToString } from "viem";
import { OVERLAY } from "../constants";

export function BurnerWallet() {
  const {
    clientComponents: { HeroSpecs, ToggledOn },
    toriiClient,
    contractComponents,
    client,
    systemCalls,
    account,
  } = useDojo();

  // sync the contract components to the local state
  // this fetches the entities from the world and updates the local state
  // useQuerySync(toriiClient, contractComponents as any, []);

  const playerId = BigInt(account?.account.address);

  const [clipboardStatus, setClipboardStatus] = useState({
    message: "",
    isError: false,
  });

  const handleRestoreBurners = async () => {
    try {
      await account?.applyFromClipboard();
      setClipboardStatus({
        message: "Burners restored successfully!",
        isError: false,
      });
    } catch (error) {
      setClipboardStatus({
        message: `Failed to restore burners from clipboard`,
        isError: true,
      });
    }
  };

  const heroTypes = [...runQuery([Has(HeroSpecs)])].map(
    (entity) => getComponentValue(HeroSpecs, entity)!.heroType
  );
  // .map((heroType) => hexToString(heroType as Hex));
  console.log("heroTypes", heroTypes);

  const getNikkeIconPath = (nikkeName: string) => {
    const nikkePath = "src/assets/nikke";
    return `${nikkePath}/icons/${nikkeName}_icon.png`;
  };

  const [selectedType, setSelectedType] = useState(0);

  useEffect(() => {
    if (clipboardStatus.message) {
      const timer = setTimeout(() => {
        setClipboardStatus({ message: "", isError: false });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [clipboardStatus.message]);

  // await client.actions.move({
  //   account: account.account,
  //   direction: { type: direction },
  // });

  return (
    <div
      className="bg-gray-900 text-white h-screen opacity-100 pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="container mx-auto p-4 sm:p-6 lg:p-10 ">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <button
            className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors duration-300"
            onClick={() => account?.create()}
          >
            {account?.isDeploying ? "Deploying Burner..." : "Create Burner"}
          </button>
          {account && account?.list().length > 0 && (
            <button
              className="px-3 py-1 sm:px-4 sm:py-2 bg-green-600 text-white text-sm sm:text-base rounded-md hover:bg-green-700 transition-colors duration-300"
              onClick={async () => await account?.copyToClipboard()}
            >
              Save Burners to Clipboard
            </button>
          )}
          <button
            className="px-3 py-1 sm:px-4 sm:py-2 bg-yellow-600 text-white text-sm sm:text-base rounded-md hover:bg-yellow-700 transition-colors duration-300"
            onClick={handleRestoreBurners}
          >
            Restore Burners from Clipboard
          </button>
          {clipboardStatus.message && (
            <div
              className={`mt-2 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-md ${
                clipboardStatus.isError
                  ? "bg-red-800 text-red-200"
                  : "bg-green-800 text-green-200"
              }`}
            >
              {clipboardStatus.message}
            </div>
          )}
        </div>

        <div className="flex flex-row">
          <div className="bg-gray-800 shadow-md rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 w-full sm:w-96 my-4 sm:my-8">
            <div className="text-base sm:text-lg font-se</div>mibold mb-3 sm:mb-4">{`Burners Deployed: ${account.count}`}</div>
            <div className="mb-3 sm:mb-4">
              <label
                htmlFor="signer-select"
                className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2"
              >
                Select Signer:
              </label>
              <select
                id="signer-select"
                className="w-full px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base text-gray-200 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={account ? account.account.address : ""}
                onChange={(e) => account.select(e.target.value)}
              >
                {account?.list().map((account, index) => (
                  <option value={account.address} key={index}>
                    {account.address}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 sm:py-2 sm:px-4 text-sm sm:text-base rounded transition duration-300 ease-in-out"
                onClick={() => account.clear()}
              >
                Clear Burners
              </button>
            </div>
          </div>

          <div className="bg-gray-800 shadow-md rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 w-full sm:w-96 my-4 sm:my-8 ml-5">
            <div className="flex flex-col gap-4 sm:gap-8">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {heroTypes.map((heroType, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedType(index)}
                    className={`cursor-pointer ${
                      selectedType === index
                        ? "border-2 border-blue-500 opacity-100 bg-gray-700"
                        : "hover:border-2 hover:border-gray-500"
                    }`}
                  >
                    <img
                      src={getNikkeIconPath(hexToString(heroType as Hex))}
                      alt={heroType}
                      className="w-20 h-20 sm:w-20 sm:h-20"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  className="btn-blue w-1/2"
                  onClick={async () => {
                    await systemCalls.mintHero(
                      account.account,
                      BigInt(heroTypes[selectedType] as Hex)
                    );
                    removeComponent(ToggledOn, OVERLAY);
                  }}
                >
                  Spawn
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <div className="grid grid-cols-3 gap-2 w-full sm:w-48 h-48 bg-gray-700 p-4 rounded-lg shadow-inner">
            <div className="col-start-2">
              <button
                className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-600 rounded-full shadow-md active:shadow-inner active:bg-gray-500 focus:outline-none text-xl sm:text-2xl font-bold text-gray-200"
                onClick={async () =>
                  // await client.actions.spawn({
                  //   account: account.account,
                  // })
                  await systemCalls.mintHero(account.account)
                }
              >
                +
              </button>
            </div>
            <div className="col-span-3 text-center text-sm sm:text-base">
              Moves Left: {moves ? `${moves.remaining}` : "Need to Spawn"}
            </div>
            <div className="col-span-3 text-center text-sm sm:text-base">
              {position
                ? `x: ${position?.vec.x}, y: ${position?.vec.y}`
                : "Need to Spawn"}
            </div>
            <div className="col-span-3 text-center text-sm sm:text-base">
              {moves && moves.last_direction}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full sm:w-48 h-48 bg-gray-700 p-4 rounded-lg shadow-inner">
            {[
              {
                direction: "Up" as const,
                label: "↑",
                col: "col-start-2",
              },
              {
                direction: "Left" as const,
                label: "←",
                col: "col-start-1",
              },
              {
                direction: "Right" as const,
                label: "→",
                col: "col-start-3",
              },
              {
                direction: "Down" as const,
                label: "↓",
                col: "col-start-2",
              },
            ].map(({ direction, label, col }) => (
              <button
                className={`${col} h-10 w-10 sm:h-12 sm:w-12 bg-gray-600 rounded-full shadow-md active:shadow-inner active:bg-gray-500 focus:outline-none text-xl sm:text-2xl font-bold text-gray-200`}
                key={direction}
                onClick={async () => {
                  const condition =
                    (direction === "Up" && position?.vec.y > 0) ||
                    (direction === "Left" && position?.vec.x > 0) ||
                    direction === "Right" ||
                    direction === "Down";

                  if (!condition) {
                    console.log("Reached the borders of the world.");
                  } else {
                    await client.actions.move({
                      account: account.account,
                      direction: { type: direction },
                    });
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div>Yes, blazingly fast! Every action here is a transaction.</div>
        </div> */}
      </div>
    </div>
  );
}
