import React, { Component } from "react";
import { BrowserRouter, Route, NavLink, Switch } from "react-router-dom";
import posed, { PoseGroup } from "react-pose";

import { Home } from "../components/Home";
import CameraContainer from "../components/CameraContainer";
import Artwork from "../components/Artwork";
import StoryPage from "../components/StoryPage";
import { OrientationContextProvider } from "../contexts/OrientationContext";
import {
  SNAP_APP_RESET_INTERVAL,
  SNAP_ATTEMPTS,
  SNAP_LANGUAGE_PREFERENCE,
  SNAP_USER_EMAIL,
} from "../constants";
import * as ROUTES from "../constants/routes";

const RouteContainer = posed.div({
  enter: { opacity: 1, delay: 0, beforeChildren: true },
  exit: { opacity: 0 },
});

const Routes = () => (
  <OrientationContextProvider>
    <Route
      render={({ location }) => (
        <PoseGroup>
          <RouteContainer key={location.pathname}>
            <Switch location={location}>
              <Route
                path={ROUTES.HOME}
                component={Home}
                exact={true}
                key="home"
              />
              <Route
                path={ROUTES.SCAN}
                component={CameraContainer}
                exact={true}
                key="scan"
              />
              <Route
                path={`${ROUTES.ARTWORK}/:imageId?`}
                component={Artwork}
                key="artwork"
              />
              <Route
                path={`${ROUTES.EXHIBITION}/:imageId?`}
                component={Artwork}
                key="artwork"
              />
              <Route
                path={`${ROUTES.STORY}/:slug`}
                component={StoryPage}
                exact={false}
                key="story"
              />
            </Switch>
          </RouteContainer>
        </PoseGroup>
      )}
    />
  </OrientationContextProvider>
);

class AppRouter extends Component<{}, { intervalId?: NodeJS.Timer }> {
  constructor(props) {
    super(props);

    this.state = {
      intervalId: null,
    };
  }

  defaultResetIfSessionAlive = () => {
    console.log("App reset interval lapsed. App will now reset.");
    localStorage.removeItem(SNAP_LANGUAGE_PREFERENCE);
    localStorage.removeItem(SNAP_USER_EMAIL);
    localStorage.removeItem(SNAP_ATTEMPTS);
  };

  componentDidMount() {
    const intervalId = setInterval(
      this.defaultResetIfSessionAlive,
      SNAP_APP_RESET_INTERVAL
    );
    // store intervalId in the state so it can be accessed later:
    this.setState({ intervalId: intervalId });
  }

  componentWillUnmount() {
    // use intervalId from the state to clear the interval
    clearInterval(this.state.intervalId);
  }

  render() {
    return (
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    );
  }
}

export default AppRouter;
