import React, { useCallback, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {
  ButtonIcon,
  GU,
  Header,
  IconClose,
  Layout,
  Tabs,
  noop,
  springs,
  useTheme,
  useToast,
  useViewport,
} from "@aragon/ui";
import { Transition, animated } from "react-spring";
// import { AragonType, AppType } from '../../prop-types'
import { useEsc } from "../../hooks";
// import { useRouting } from '../../routing'
import Network from "./Network/Network";
// import SharedIdentities from "./SharedIdentities/SharedIdentities";

// import { parsePreferences } from "../../routing-utils";

const SECTIONS = new Map([
  ["custom-labels", "Custom Labels"],
  ["network", "Network"],
  ["notifications", "Notifications"],
  ["help-and-feedback", "Help and feedback"],
]);
const SECTION_PATHS = Array.from(SECTIONS.keys());
const SECTION_VALUES = Array.from(SECTIONS.values());

// const CUSTOM_LABELS_INDEX = 0;
const NETWORK_INDEX = 1;
// const NOTIFICATIONS_INDEX = 2;
// const HELP_AND_FEEDBACK_INDEX = 3;

const AnimatedDiv = animated.div;

function GlobalPreferencesContent({
  apps,
  compact,
  onNavigation,
  sectionIndex,
  subsection,
  wrapper,
}) {
  // const toast = useToast();
  // const routing = useRouting();

  const closePreferences = useCallback(
    () => {
      window.location.hash =
        window.location.hash.split("?preferences")[0] || "";
      /* routing.update((locator) => ({ ...locator, preferences: {} })); */
    },
    [
      /* routing */
    ]
  );

  useEsc(closePreferences);

  const container = useRef();
  useEffect(() => {
    if (container.current) {
      container.current.focus();
    }
  }, []);

  const [menuItems, menuItemIndex] = useMemo(() => {
    // Only show network preferences if the `wrapper` does not exist yet (for example, during onboarding)
    return wrapper
      ? [SECTION_VALUES, sectionIndex]
      : [[SECTION_VALUES[NETWORK_INDEX]], 0];
  }, [wrapper, sectionIndex]);

  return (
    <div ref={container} tabIndex="0" css="outline: 0">
      <Layout css="z-index: 2">
        <Close compact={compact} onClick={closePreferences} />
        <Header
          primary={"Global preferences"}
          css={`
            padding-top: ${!compact ? 10 * GU : 0}px;
          `}
        />
        <React.Fragment>
          <Tabs
            items={menuItems}
            onChange={wrapper ? onNavigation : noop}
            selected={menuItemIndex}
          />
          <main>
            {sectionIndex === NETWORK_INDEX && <Network wrapper={wrapper} />}
          </main>
        </React.Fragment>
      </Layout>
    </div>
  );
}

GlobalPreferencesContent.propTypes = {
  compact: PropTypes.bool,
  onNavigation: PropTypes.func.isRequired,
  sectionIndex: PropTypes.number,
  subsection: PropTypes.string,
};

function useGlobalPreferences() {
  const location = useLocation();
  const { search } = location;

  const [, section = "", subsection = ""] = search.split("/");

  const handleNavigation = useCallback(
    (index) => {
      console.log("TODO handleNavigation");
      /* routing.update((locator) => ({
        ...locator,
        preferences: { section: SECTION_PATHS[index] },
      })); */
    },
    [
      /* routing */
    ]
  );

  const sectionIndex = SECTION_PATHS.findIndex(
    (_section) => _section === section
  );

  return { sectionIndex, subsection, handleNavigation };
}

function Close({ compact, onClick }) {
  const theme = useTheme();
  return (
    <div
      css={`
        position: absolute;
        right: 0;
        padding-top: ${2.5 * GU}px;
        padding-right: ${3 * GU}px;

        ${compact &&
        `
            padding-top: ${2 * GU}px;
            padding-right: ${1.5 * GU}px;
          `}
      `}
    >
      <ButtonIcon onClick={onClick} label="Close">
        <IconClose
          css={`
            color: ${theme.surfaceIcon};
          `}
        />
      </ButtonIcon>
    </div>
  );
}

Close.propTypes = {
  compact: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

function GlobalPreferences(props) {
  const { sectionIndex, subsection, handleNavigation } = useGlobalPreferences();

  const { below, above } = useViewport();
  const compact = below("medium");
  const theme = useTheme();

  return (
    <Transition
      native
      items={sectionIndex > -1}
      from={{ opacity: 0, enterProgress: 0, blocking: false }}
      enter={{ opacity: 1, enterProgress: 1, blocking: true }}
      leave={{ opacity: 0, enterProgress: 1, blocking: false }}
      config={springs.smooth}
    >
      {
        (show) =>
          show &&
          /* eslint-disable react/prop-types */
          // z-index 2 on mobile keeps the menu above this preferences modal
          (({ opacity, enterProgress, blocking }) => (
            <AnimatedDiv
              style={{
                zIndex: 1,
                pointerEvents: blocking ? "auto" : "none",
                opacity,
                transform: enterProgress.interpolate(
                  (v) => `
                  translate3d(0, ${(1 - v) * 10}px, 0)
                  scale3d(${1 - (1 - v) * 0.03}, ${1 - (1 - v) * 0.03}, 1)
                `
                ),
              }}
              css={`
                position: fixed;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                overflow: auto;
                min-width: 360px;
                padding-bottom: ${2 * GU}px;
                border-top: 2px solid ${theme.accent};
                background: ${theme.surface};
                ${above("medium") &&
                `
                  padding-bottom: 0;
                `}
              `}
            >
              <GlobalPreferencesContent
                compact={compact}
                sectionIndex={sectionIndex}
                subsection={subsection}
                onNavigation={handleNavigation}
              />
            </AnimatedDiv>
          ))
        /* eslint-enable react/prop-types */
      }
    </Transition>
  );
}

export default React.memo(GlobalPreferences);
