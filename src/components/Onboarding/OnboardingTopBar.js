import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Button, GU, IconSettings, useTheme } from "@aragon/ui";
import AccountModule from "../AccountModule/AccountModule";
import HomeButton from "../HomeButton/HomeButton";

function OnboardingTopBar({ status, solid }) {
  const theme = useTheme();

  const handleSettingsClick = useCallback(() => {
    let path = "/";
    if (status === "open") {
      path = "/open";
    }
    if (status === "create") {
      path = "/create";
    }
    window.location.hash = path + "?preferences=/network";
  }, [status]);

  return (
    <React.Fragment>
      <div
        className="xxx"
        css={`
          position: absolute;
          z-index: 2;
          top: 0;
          left: 0;
          right: 0;
          height: ${8.5 * GU}px;
          background: ${theme.surface.alpha(solid ? 0.8 : 0)};
          transition: background 150ms ease-in-out;
          backdrop-filter: blur(6px);
        `}
      >
        <div
          css={`
            position: absolute;
            top: 0;
            z-index: 1;
            width: 100%;
            border-top: 2px solid ${theme.accent};
          `}
        />

        <HomeButton
          css={`
            position: absolute;
            top: ${1 * GU}px;
            left: ${1 * GU}px;
          `}
        />

        <div
          css={`
            display: flex;
            align-items: center;
            position: absolute;
            top: 0;
            right: ${2 * GU}px;
            height: 100%;
          `}
        >
          <div
            css={`
              display: flex;
              align-items: center;
              margin-right: ${1 * GU}px;
              height: 100%;
            `}
          >
            <AccountModule />
          </div>
          <Button
            display="icon"
            icon={<IconSettings />}
            label="Settings"
            size="medium"
            onClick={handleSettingsClick}
          />
        </div>
      </div>
    </React.Fragment>
  );
}

OnboardingTopBar.propTypes = {
  solid: PropTypes.bool,
};

export default OnboardingTopBar;
