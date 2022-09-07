import environmentConfiguration, {
  EnvironmentStages,
  isDevelopment,
  isProduction,
  isLocal,
} from "./environmentConfig";
import applicationConfiguration from "./applicationConfig";

export default environmentConfiguration;
export {
  environmentConfiguration,
  applicationConfiguration,
  EnvironmentStages,
  isDevelopment,
  isLocal,
  isProduction,
};
