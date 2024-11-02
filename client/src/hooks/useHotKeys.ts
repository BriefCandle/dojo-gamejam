import { useEffect } from "react";
import { OVERLAY } from "../constants";
import { useDojo } from "../dojo/useDojo";
import { getComponentValue, setComponent } from "@dojoengine/recs";

export default function useHotkeys() {
  const {
    clientComponents,
    toriiClient,
    contractComponents,
    client,
    systemCalls,
    account,
  } = useDojo();
  const { ToggledOn } = clientComponents;

  // const targets = [...useEntityQuery([Has(MarkedTarget)])];
  // const target = useComponentValue(SelectedHost, TARGET)?.value as Entity;
  // console.log("targets", targets);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key == "h") {
        const overlayOn = getComponentValue(ToggledOn, OVERLAY)?.value ?? false;
        overlayOn
          ? setComponent(ToggledOn, OVERLAY, { value: false })
          : setComponent(ToggledOn, OVERLAY, { value: true });
      }
    };
    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, []);
}
