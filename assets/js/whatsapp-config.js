/**
 * WhatsApp configuration shared across pages.
 * Values below can be managed via the CMS – avoid editing manually.
 */
(function (global) {
  const existingConfig = global.whatsappConfig || {};

  const cmsConfig = {
    projectName: "Godrej Arden Sigma 3 Greater Noida (NCR)",
    phoneNumber: "9667571967",
    contactNumber: "9667571967",
    visibility: {"nonRera":{"whatsapp":true,"chatbot":true,"contact":true},"nriNonRera":{"whatsapp":false,"chatbot":true,"contact":false},"onRera":{"whatsapp":true,"chatbot":false,"contact":false},"nriRera":{"whatsapp":true,"chatbot":false,"contact":false}},
    chatbot: {
      phoneNumber: "9667571967",
      message:
        "Hey There, I would like to explore further details About Godrej Arden Sigma 3 Greater Noida (NCR). Please Share Details.",
    },
  };

  const config = {
    ...cmsConfig,
    ...existingConfig,
    chatbot: {
      ...cmsConfig.chatbot,
      ...(existingConfig.chatbot || {}),
    },
  };

  function buildDefaultMessages(projectName) {
    const project = projectName || cmsConfig.projectName;
    return {
      defaultMsg: `Hey There, I would like to explore further details About ${project}. Please Share Details.`,
      google: `Hello, I would like to explore further details about ${project}.`,
      ppc: `Hi I'm interested in Learning more About ${project}. Please Share Details.`,
      bing: `Hi There, I'm interested in Learning more About ${project}. Please Share Details.`,
      bingo: `Hello There, I would like to explore further details About ${project}. Please Share Details.`,
      wapp: `Hey, I would like to explore further details About ${project}. Please Share Details.`,
      wappint: `Hey, I would like to explore further details About ${project}. Please Share Details.`,
      chatbot: `Hey There, I would like to explore further details About ${project}. Please Share Details.`,
    };
  }

  const baseMessages = buildDefaultMessages(config.projectName);
  config.messageMap = {
    ...baseMessages,
    ...(existingConfig.messageMap || {}),
  };

  config.getMessage = function getMessage(key, fallback) {
    const candidate = config.messageMap[key];
    if (candidate && candidate.trim().length) {
      return candidate;
    }
    if (fallback) return fallback;
    return config.messageMap.defaultMsg;
  };

  global.whatsappConfig = config;
})(window);
