'use client';

import { FocusEvent, forwardRef, InputHTMLAttributes, KeyboardEvent, useCallback, useEffect, useId, useRef } from 'react';
import styles from './Multiselect.module.css';
export {styles as MultiselectClasses};


import { Keys } from 'helpers/accessibility';
import { classNames } from 'helpers/classNames';
import { callMultiple } from 'helpers/function';
import { multipleRef } from 'helpers/react/refs';
import { useGlobalClicks } from 'hooks/useGlobalClicks';

import { Icon20ChevronDown } from 'icons/20/chevron_down';

import { FormInput, FormPublicProps } from 'components/Form/FormInput/FormInput';
import { MultiselectBase, MultiselectBaseProps } from './components/MultiselectBase/MultiselectBase';
import { MultiselectDropdown, MultiselectDropdownProps } from './components/MultiselectDropdown/MultiselectDropdown';
import { FOCUS_ACTION_NEXT, FOCUS_ACTION_PREV, FocusActionType, isServicePreset } from './hooks/constants';
import { useMultiselect, UseMultiselectProps } from './hooks/useMultiselect';
import { MultiselectOption } from './types';

export interface MultiselectProps extends
  Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'>,
  Omit<FormPublicProps, 'after'>,
  Pick<MultiselectDropdownProps, 'closeDropdownAfterSelect' | 'renderOption'>,
  Pick<UseMultiselectProps, 'value' | 'defaultValue' | 'onChange' | 'filterFn' | 'onInputChange' | 'inputValue' | 'selectedBehavior' | 'emptyText' | 'creatable'>,
  Pick<MultiselectBaseProps, 'renderChip'> {
  /**
   * The `options` property defines the available options within the multiselect dropdown.
   * Each option is represented as an object conforming to the `MultiselectOption` structure,
   * which typically includes properties like `value` (the option's value) and `label` (the human-readable text associated with the option).
   */
  options: MultiselectOption[];
}

/**
 * A comprehensive component for rendering a multiselect input field with customizable options, dropdown behaviors, and chip display.
 * It integrates functionality for selecting multiple options, searching, and even creating new options based on user input.
 */
export const Multiselect = forwardRef<HTMLDivElement, MultiselectProps>(({
  // FormInput options
  header,
  before,
  status,
  className,
  children,
  disabled,

  // CustomSelectDropdownProps
  options: optionsProp,
  closeDropdownAfterSelect = false,
  selectedBehavior,
  emptyText,
  creatable = false,
  filterFn,

  // MultiselectInputProps
  value: valueProp = [],
  defaultValue,
  inputValue: inputValueProp,
  renderChip,
  renderOption,
  onInputChange: onInputChangeProp,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  ...restProps
}, ref) => {
  const {
    // Option props
    value,
    addOptionFromInput,
    addOption,
    removeOption,

    // Input props
    inputRef,
    inputValue,
    clearInput,
    onInputChange,

    // Dropdown props
    options,
    opened,
    setOpened,
    focusedOption,
    focusedOptionIndex,
    setFocusedOption,
    setFocusedOptionIndex,
  } = useMultiselect({
    // Option props
    value: valueProp,
    defaultValue,
    onChange,

    // Input props
    inputValue: inputValueProp,
    onInputChange: onInputChangeProp,

    // Dropdown props
    options: optionsProp,
    emptyText,
    creatable,
    filterFn,
    selectedBehavior,

    // Other props
    disabled,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef(null);

  const dropdownAriaId = useId();
  const dropdownScrollBoxRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    setOpened(true);
    setFocusedOptionIndex(null);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.defaultPrevented && !creatable) {
      event.preventDefault();
    }
  };

  const optionsNodes = useRef<HTMLElement[]>([]).current;
  const scrollToElement = (index: number, center = false) => {
    const dropdown = dropdownScrollBoxRef.current;
    const item = optionsNodes[index];

    if (!item || !dropdown) {
      return;
    }

    const dropdownHeight = dropdown.offsetHeight;
    const { scrollTop } = dropdown;
    const itemTop = item.offsetTop;
    const itemHeight = item.offsetHeight;

    if (center) {
      dropdown.scrollTop = itemTop - dropdownHeight / 2 + itemHeight / 2;
    } else if (itemTop + itemHeight > dropdownHeight + scrollTop) {
      dropdown.scrollTop = itemTop - dropdownHeight + itemHeight;
    } else if (itemTop < scrollTop) {
      dropdown.scrollTop = itemTop;
    }
  };

  const focusOptionByIndex = (index: number, oldIndex: number | null) => {
    let focusedIndex = index;
    const { length } = options;

    if (index < 0) {
      focusedIndex = length - 1;
    } else if (index >= length) {
      focusedIndex = 0;
    }

    if (focusedIndex === oldIndex) {
      return;
    }

    scrollToElement(focusedIndex);
    setFocusedOptionIndex(focusedIndex);
  };

  const focusOption = (nextIndex: number | null, type: FocusActionType) => {
    let index = nextIndex === null ? -1 : nextIndex;

    if (type === FOCUS_ACTION_NEXT) {
      index += 1;
    }

    if (type === FOCUS_ACTION_PREV) {
      index -= 1;
    }

    focusOptionByIndex(index, focusedOptionIndex);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.defaultPrevented) {
      return;
    }

    switch (event.key) {
      case Keys.ARROW_UP:
      case Keys.ARROW_DOWN:
        event.preventDefault();

        if (opened) {
          focusOption(focusedOptionIndex, event.key === Keys.ARROW_UP ? FOCUS_ACTION_PREV : FOCUS_ACTION_NEXT);
          return;
        }

        setOpened(true);
        setFocusedOptionIndex(0);
        break;

      case Keys.ENTER: {
        if (!opened) {
          break;
        }

        if (!creatable) {
          event.preventDefault();
        }

        if (focusedOptionIndex === null) {
          break;
        }

        const foundOption = options[focusedOptionIndex];
        if (!foundOption || isServicePreset(foundOption)) {
          break;
        }

        event.preventDefault();
        addOption(foundOption);
        setFocusedOptionIndex(null);
        clearInput();

        closeDropdownAfterSelect && setOpened(false);
        break;
      }

      case Keys.ESCAPE:
      case Keys.TAB:
        opened && setOpened(false);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (focusedOptionIndex === null) {
      setFocusedOption(null);
      return;
    }

    const foundFocusedOptionIndex = options[focusedOptionIndex];
    if (foundFocusedOptionIndex && !isServicePreset(foundFocusedOptionIndex)) {
      setFocusedOption(foundFocusedOptionIndex);
    }
  }, [options, focusedOptionIndex, setFocusedOption]);

  const onDropdownMouseLeave = useCallback(() => {
    setFocusedOptionIndex(null);
  }, [setFocusedOptionIndex]);

  const toggleOpened = () => {
    setOpened((prevOpened) => !prevOpened);
  };

  const handleClickOutside = useCallback(() => {
    setOpened(false);
  }, [setOpened]);

  const setOptionNode = (index: number, node: HTMLElement) => {
    optionsNodes[index] = node;
  };

  useGlobalClicks(
    handleClickOutside,
    opened ? rootRef : null,
    opened ? dropdownScrollBoxRef : null,
  );

  const controlledStatus = status || (opened ? 'focused' : 'default');
  return (
    <FormInput
      ref={multipleRef(ref, containerRef)}
      header={header}
      before={before}
      status={controlledStatus}
      disabled={disabled}
      className={classNames(styles.wrapper, className)}
    >
      <MultiselectBase
        {...restProps}
        // FormFieldProps
        ref={rootRef}
        className={styles.base}
        // Option props
        onAddChipOption={addOptionFromInput}
        onRemoveChipOption={removeOption}
        renderChip={renderChip}
        chipsValue={value}
        // Input props
        value={inputValue}
        inputRef={inputRef}
        onChange={onInputChange}
        onFocus={callMultiple(handleFocus, onFocus)}
        onBlur={callMultiple(handleBlur, onBlur)}
        onKeyDown={callMultiple(handleKeyDown, onKeyDown)}
        // a11y props
        role="combobox"
        aria-expanded={opened}
        aria-controls={dropdownAriaId}
        aria-haspopup="listbox"
      />
      <Icon20ChevronDown aria-hidden onClick={toggleOpened} className={styles.chevron} />
      {opened && (
        <MultiselectDropdown
          ref={dropdownScrollBoxRef}
          dropdownAriaId={dropdownAriaId}
          options={options}
          onMouseLeave={onDropdownMouseLeave}
          targetRef={rootRef}
          addOptionFromInput={() => addOptionFromInput(inputValue)}
          setFocusedOptionIndex={setFocusedOptionIndex}
          renderOption={renderOption}
          focusedOption={focusedOption}
          value={value}
          setOptionNode={setOptionNode}
          setOpened={setOpened}
          closeDropdownAfterSelect={closeDropdownAfterSelect}
          addOption={addOption}
          clearInput={clearInput}
          focusedOptionIndex={focusedOptionIndex}
        />
      )}
    </FormInput>
  );
});

