import React, { SyntheticEvent } from "react";

import { basicButtonStyle, flexGapReplacementStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IconDefinition,
  faCut,
  faStepBackward,
  faStepForward,
  faTrash,
  faTrashRestore,
  } from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/react'

import { useDispatch, useSelector } from 'react-redux';
import {
  cut, markAsDeletedOrAlive, selectIsCurrentSegmentAlive, mergeLeft, mergeRight
} from '../redux/videoSlice'
import { GlobalHotKeys, KeySequence, KeyMapOptions } from "react-hotkeys";
import { selectMainMenuState } from "../redux/mainMenuSlice";
import { MainMenuStateNames } from "../types";
import { cuttingKeyMap } from "../globalKeys";
import { ActionCreatorWithoutPayload } from "@reduxjs/toolkit";

import './../i18n/config';
import { useTranslation } from 'react-i18next';

/**
 * Defines the different actions a user can perform while in cutting mode
 */
const CuttingActions: React.FC<{}> = () => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch();
  const mainMenuState = useSelector(selectMainMenuState)

  /**
   * General action callback for cutting actions
   * @param event event triggered by click or button press
   * @param action redux event to dispatch
   * @param ref Pass a reference if the clicked element should lose focus
   */
  const dispatchAction = (event: KeyboardEvent | SyntheticEvent, action: ActionCreatorWithoutPayload<string>, ref: React.RefObject<HTMLDivElement> | undefined) => {
    event.preventDefault()                      // Prevent page scrolling due to Space bar press
    event.stopPropagation()                     // Prevent video playback due to Space bar press
    dispatch(action())

    // Lose focus if clicked by mouse
    if (ref) {
      ref.current?.blur()
    }
  }

  // Maps functions to hotkeys
  const handlers = {
    cut: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, cut, undefined) } },
    delete: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, markAsDeletedOrAlive, undefined) } },
    mergeLeft: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, mergeLeft, undefined) } },
    mergeRight: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, mergeRight, undefined) } },
  }

  const cuttingStyle =  css({
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    ...(flexGapReplacementStyle(30, true)),
  })

  const blockStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    ...(flexGapReplacementStyle(30, true)),
  })

  return (
    <GlobalHotKeys keyMap={cuttingKeyMap} handlers={mainMenuState === MainMenuStateNames.cutting ? handlers: {}} allowChanges={true} >
      <div css={cuttingStyle}>
          <div css={blockStyle}>
            <CuttingActionsButton iconName={faCut}
              actionName={t("cuttingActions.cut-button")} actionHandler={dispatchAction} action={cut}
              tooltip={t('cuttingActions.cut-tooltip', { hotkeyName: (cuttingKeyMap[handlers.cut.name] as KeyMapOptions).sequence })}
              ariaLabelText={t('cuttingActions.cut-tooltip-aria', { hotkeyName: (cuttingKeyMap[handlers.cut.name] as KeyMapOptions).sequence })}
            />
            <MarkAsDeletedButton actionHandler={dispatchAction} action={markAsDeletedOrAlive}
              hotKeyName={(cuttingKeyMap[handlers.delete.name] as KeyMapOptions).sequence}
            />
            <CuttingActionsButton iconName={faStepBackward}
              actionName={t("cuttingActions.mergeLeft-button")} actionHandler={dispatchAction} action={mergeLeft}
              tooltip={t('cuttingActions.mergeLeft-tooltip', { hotkeyName: (cuttingKeyMap[handlers.mergeLeft.name] as KeyMapOptions).sequence })}
              ariaLabelText={t('cuttingActions.mergeLeft-tooltip-aria', { hotkeyName: (cuttingKeyMap[handlers.mergeLeft.name] as KeyMapOptions).sequence })}
            />
            <CuttingActionsButton iconName={faStepForward}
              actionName={t("cuttingActions.mergeRight-button")} actionHandler={dispatchAction} action={mergeRight}
              tooltip={t('cuttingActions.mergeRight-tooltip', { hotkeyName: (cuttingKeyMap[handlers.mergeRight.name] as KeyMapOptions).sequence })}
              ariaLabelText={t('cuttingActions.mergeRight-tooltip-aria', { hotkeyName: (cuttingKeyMap[handlers.mergeRight.name] as KeyMapOptions).sequence })}
            />
          </div>
          <div css={blockStyle}>
            {/* <CuttingActionsButton iconName={faQuestion} actionName="Reset changes" action={null}
              tooltip="Not implemented"
              ariaLabelText="Reset changes. Not implemented"
            />
            <CuttingActionsButton iconName={faQuestion} actionName="Undo" action={null}
              tooltip="Not implemented"
              ariaLabelText="Undo. Not implemented"
            /> */}
          </div>
      </div>
    </GlobalHotKeys>
  );
};

/**
 * CSS for cutting buttons
 */
const cuttingActionButtonStyle = {
  padding: '16px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
};

interface cuttingActionsButtonInterface {
  iconName: IconDefinition,
  actionName: string,
  actionHandler: (event: KeyboardEvent | SyntheticEvent, action: ActionCreatorWithoutPayload<string>, ref: React.RefObject<HTMLDivElement> | undefined) => void,
  action: ActionCreatorWithoutPayload<string>,
  tooltip: string,
  ariaLabelText: string,
}

/**
 * A button representing a single action a user can take while cutting
 * @param param0
 */
const CuttingActionsButton: React.FC<cuttingActionsButtonInterface> = ({iconName, actionName, actionHandler, action, tooltip, ariaLabelText}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  return (
    <div css={[basicButtonStyle, cuttingActionButtonStyle]}
      title={tooltip}
      ref={ref}
      role="button" tabIndex={0} aria-label={ariaLabelText}
      onClick={ (event: SyntheticEvent) => actionHandler(event, action, ref) }
      onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
        actionHandler(event, action, undefined)
      }}}
      >
      <FontAwesomeIcon icon={iconName} size="1x" />
      <span>{actionName}</span>
    </div>
  );
};

interface markAsDeleteButtonInterface {
  actionHandler: (event: KeyboardEvent | SyntheticEvent, action: ActionCreatorWithoutPayload<string>, ref: React.RefObject<HTMLDivElement> | undefined) => void,
  action: ActionCreatorWithoutPayload<string>,
  hotKeyName: KeySequence,
}

/**
 * Button that changes its function based on context
 */
const MarkAsDeletedButton : React.FC<markAsDeleteButtonInterface> = ({actionHandler, action, hotKeyName}) => {
  const { t } = useTranslation();
  const isCurrentSegmentAlive = useSelector(selectIsCurrentSegmentAlive)
  const ref = React.useRef<HTMLDivElement>(null)

  return (
    <div css={[basicButtonStyle, cuttingActionButtonStyle]}
      title={t('cuttingActions.delete-restore-tooltip', { hotkeyName: hotKeyName })}
      ref={ref}
      role="button" tabIndex={0}
      aria-label={t('cuttingActions.delete-restore-tooltip-aria', { hotkeyName: hotKeyName })}
      onClick={(event: SyntheticEvent) => actionHandler(event, action, ref)}
      onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
        actionHandler(event, action, undefined)
      }}}
      >
      <FontAwesomeIcon icon={isCurrentSegmentAlive ? faTrash : faTrashRestore} size="1x" />
      <div>{isCurrentSegmentAlive ? t('cuttingActions.delete-button') : t("cuttingActions.restore-button")}</div>
    </div>
  );
}

export default CuttingActions;
