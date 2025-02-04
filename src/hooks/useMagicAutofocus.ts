import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { InteractionManager, TextInput } from 'react-native';
import isNativeStackAvailable from '../helpers/isNativeStackAvailable';
import { setListener } from '../navigation/nativeStackHelpers';
import useInteraction from './useInteraction';

const { currentlyFocusedInput, focusTextInput } = TextInput.State;

let timeout: ReturnType<typeof setTimeout> | null = null;
let delay = false;
let cancel = false;

export function delayNext() {
  if (timeout !== null) {
    clearTimeout(timeout);
    timeout = null;
  }
  delay = true;
  cancel = false;
}

export function cancelNext() {
  cancel = true;
}

export function uncancelNext() {
  cancel = false;
}

export default function useMagicAutofocus(
  defaultAutofocusInputRef: any,
  customTriggerFocusCallback: any,
  shouldFocusOnNavigateOnAndroid = false,
  showAfterInteractions = false
) {
  const isScreenFocused = useIsFocused();
  const lastFocusedInputHandle = useRef(null);

  const handleFocus = useCallback(({ target }) => {
    lastFocusedInputHandle.current = target.getNativeRef();
  }, []);

  const setLastFocusedInputHandle = useCallback(ref => {
    lastFocusedInputHandle.current = ref.current;
  }, []);

  const triggerFocus = useCallback(() => {
    if (cancel) {
      cancel = false;
      return;
    }

    if (!lastFocusedInputHandle.current) {
      return focusTextInput(defaultAutofocusInputRef.current);
    }

    if (customTriggerFocusCallback) {
      const nextInput = customTriggerFocusCallback(lastFocusedInputHandle);
      return nextInput && focusTextInput(nextInput);
    }

    if (lastFocusedInputHandle.current !== currentlyFocusedInput()) {
      return focusTextInput(lastFocusedInputHandle.current);
    }
  }, [customTriggerFocusCallback, defaultAutofocusInputRef]);

  const [createRefocusInteraction] = useInteraction();
  const fallbackRefocusLastInput = useCallback(() => {
    createRefocusInteraction(() => {
      if (isScreenFocused) {
        triggerFocus();
      }
    });
  }, [createRefocusInteraction, isScreenFocused, triggerFocus]);

  // ✨️ Make the magic happen
  useFocusEffect(
    useCallback(() => {
      if (android && !shouldFocusOnNavigateOnAndroid) {
        return;
      }

      setListener(triggerFocus);
      if (delay) {
        InteractionManager.runAfterInteractions(() => {
          if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
          }
          timeout = setTimeout(() => {
            triggerFocus();
            delay = false;
          }, 200);
        });
      } else if (!isNativeStackAvailable) {
        // We need to do this in order to assure that the input gets focused
        // when using fallback stacks.
        InteractionManager.runAfterInteractions(fallbackRefocusLastInput);
      } else {
        if (showAfterInteractions) {
          InteractionManager.runAfterInteractions(triggerFocus);
        } else {
          triggerFocus();
        }
      }

      return () => {
        setListener(null);
      };
    }, [
      fallbackRefocusLastInput,
      shouldFocusOnNavigateOnAndroid,
      showAfterInteractions,
      triggerFocus,
    ])
  );

  return {
    handleFocus,
    lastFocusedInputHandle,
    setLastFocusedInputHandle,
    triggerFocus,
  };
}
