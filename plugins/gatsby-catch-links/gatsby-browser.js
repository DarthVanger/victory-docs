import { navigate } from "gatsby";
import config from "../../data/site-config";

import catchLinks from "./catch-links";

catchLinks(
  window,
  (href) => navigate(href),
  config.pathPrefix
);
