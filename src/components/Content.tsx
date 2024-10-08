import React from "react";
import { Timeline, Tween } from "react-gsap";
import { Controller, Scene } from "react-scrollmagic";
// @ts-ignore
import styled from "styled-components";

const SectionWipesStyled = styled.div`
  overflow: hidden;
  .panel {
    height: 100vh;
    width: 100vw;
    text-align: center;
  }
  .panel span {
    position: relative;
    display: block;
    overflow: visible;
    top: 50%;
    font-size: 80px;
  }
  .panel h1 {
    margin: 0;
    padding: 50px;
  }
  .panel.blue {
    background-color: #3883d8;
  }
  .panel.turqoise {
    background-color: #38ced7;
  }
  .panel.green {
    background-color: #22d659;
    margin-bottom: 1000px;
  }
  .panel.bordeaux {
    background-color: #953543;
  }
`;

const tweenProps = {
  ease: "Back.easeInOut",
  from: {
    opacity: 0,
    xPercent: -100,
  },
  to: {
    opacity: 1,
    xPercent: 0,
  },
};

const FadeInTimeline: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <Timeline totalProgress={progress * 2} paused>
      <Tween {...tweenProps}>
        <h1>Fade 1</h1>
      </Tween>
      <Tween {...tweenProps}>
        <h1>Fade 2</h1>
      </Tween>
      <Tween {...tweenProps}>
        <h1>Fade 3</h1>
      </Tween>
      <Tween {...tweenProps}>
        <h1>Fade 4</h1>
      </Tween>
    </Timeline>
  );
};

const SectionWipes = () => (
  <SectionWipesStyled>
    <Controller globalSceneOptions={{ triggerHook: "onLeave" }}>
      <Scene pin>
        <div className="panel blue">
          <span>Panel</span>
        </div>
      </Scene>
      <Scene pin>
        <div className="panel turqoise">
          <span>Panel</span>
        </div>
      </Scene>
      {/* There is something weird going on with react-scrollmagic types that
          keeps giving us an error, but we can't change this component or update
          the dependency or else it breaks! */}
      {/* @ts-ignore  */}
      <Scene pin pinSettings={{ pushFollowers: false }} duration="2000">
        {(progress) => (
          <div className="panel green">
            <FadeInTimeline progress={progress} />
          </div>
        )}
      </Scene>
      <Scene pin>
        <div className="panel bordeaux">
          <span>Panel</span>
        </div>
      </Scene>
    </Controller>
  </SectionWipesStyled>
);

export default SectionWipes;
