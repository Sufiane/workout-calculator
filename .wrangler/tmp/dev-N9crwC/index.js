var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-oU7f51/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/utils/round.utils.ts
var rounding = /* @__PURE__ */ __name((toRound) => {
  console.log({
    beforeRounding: toRound,
    afterRounding: Math.ceil(toRound / 2.5) * 2.5,
    afterRoundingDown: Math.floor(toRound / 2.5) * 2.5
  });
  const roundingUp = Math.ceil(toRound / 2.5) * 2.5;
  const roundingDown = Math.floor(toRound / 2.5) * 2.5;
  const diffUp = Math.abs(toRound - roundingUp);
  const diffDown = Math.abs(toRound - roundingDown);
  if (diffUp > diffDown) {
    return roundingDown;
  } else {
    return roundingUp;
  }
}, "rounding");

// src/service.ts
function calculateFromMaxRm(maxRm) {
  const max90 = rounding(maxRm * 0.9);
  return {
    maxRm,
    max90,
    rep85: rounding(max90 * 0.85),
    rep90: rounding(max90 * 0.9),
    rep95: rounding(max90 * 0.95),
    nextMax90: rounding(max90 + 2.5)
  };
}
__name(calculateFromMaxRm, "calculateFromMaxRm");
function calculateFromMax90(max90) {
  return {
    maxRm: rounding(max90 * 100 / 90),
    max90,
    rep85: rounding(max90 * 0.85),
    rep90: rounding(max90 * 0.9),
    rep95: rounding(max90 * 0.95),
    nextMax90: rounding(max90 + 2.5)
  };
}
__name(calculateFromMax90, "calculateFromMax90");
function calculateFromRep95(rep95) {
  const max90 = rounding(rep95 * 100 / 95);
  return {
    maxRm: rounding(max90 * 100 / 90),
    max90,
    rep85: rounding(max90 * 0.85),
    rep90: rounding(max90 * 0.9),
    rep95,
    nextMax90: rounding(max90 + 2.5)
  };
}
__name(calculateFromRep95, "calculateFromRep95");
function calculateFromRep90(rep90) {
  const max90 = rounding(rep90 * 100 / 90);
  return {
    maxRm: rounding(max90 * 100 / 90),
    max90,
    rep85: rounding(max90 * 0.85),
    rep90,
    rep95: rounding(max90 * 0.95),
    nextMax90: rounding(max90 + 2.5)
  };
}
__name(calculateFromRep90, "calculateFromRep90");
function calculateFromRep85(rep85) {
  const max90 = rounding(rep85 * 100 / 85);
  return {
    maxRm: rounding(max90 * 100 / 90),
    max90,
    rep85,
    rep90: rounding(max90 * 0.9),
    rep95: rounding(max90 * 0.95),
    nextMax90: rounding(max90 + 2.5)
  };
}
__name(calculateFromRep85, "calculateFromRep85");
var generateBenchProgram = /* @__PURE__ */ __name(({
  maxRm,
  max90,
  rep85,
  rep90,
  rep95
}) => {
  if (!maxRm && !max90 && !rep85 && !rep90 && !rep95) {
    throw new Error("min_one_ref_value_needed");
  }
  switch (true) {
    case maxRm !== void 0:
      return calculateFromMaxRm(maxRm);
    case max90 !== void 0:
      return calculateFromMax90(max90);
    case rep95 !== void 0:
      return calculateFromRep95(rep95);
    case rep90 !== void 0:
      return calculateFromRep90(rep90);
    case rep85 !== void 0:
      return calculateFromRep85(rep85);
    default: {
      throw new Error("missing_params");
    }
  }
}, "generateBenchProgram");

// src/index.ts
var handleProgram = /* @__PURE__ */ __name(async (query, env) => {
  const result = generateBenchProgram({
    maxRm: Number(query.get("maxRm")) || void 0,
    max90: Number(query.get("max90")) || void 0,
    rep85: Number(query.get("rep85")) || void 0,
    rep90: Number(query.get("rep90")) || void 0,
    rep95: Number(query.get("rep95")) || void 0
  });
  await env.LATEST_VALUE.put("latest", JSON.stringify(result));
  return Response.json(result);
}, "handleProgram");
var handleFavicon = /* @__PURE__ */ __name(() => {
  return new Response(null, { status: 204 });
}, "handleFavicon");
var handleLatest = /* @__PURE__ */ __name(async (env) => {
  const value = await env.LATEST_VALUE.get("latest");
  return Response.json(value ? JSON.parse(value) : "no_latest_recorded");
}, "handleLatest");
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/favicon.ico") {
      return handleFavicon();
    }
    if (url.pathname === "/latest") {
      return handleLatest(env);
    }
    const query = url.searchParams;
    if (query.size === 0) {
      return Response.json({
        instructions: "You need to specify the query parameters.",
        parameters: {
          maxRm: "Your max repetition",
          max90: "90% of your max repetition",
          rep85: "How much you can push doing 5x5. The load you can push at 85% of your 95% of your max 90. ie: ",
          rep90: "How much you can push doing 5x3rep",
          rep95: "How much you can push doing 5x1rep"
        }
      });
    }
    return handleProgram(query, env);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-oU7f51/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-oU7f51/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
