import firebaseProvider from 'firebase/app';
import Vue from 'vue';
import { VIcon, VListItemTitle, VListItemSubtitle, VListItemContent, VListItem, VList, VAlert, VTextField, VCheckbox, VCardText, VBtn, VCardActions, VCard, VContainer, VForm, VTooltip, VCardTitle, VCol, VRow, VDialog, VProgressLinear, VTab, VTabs, VTabItem, VTabsItems } from 'vuetify/lib';
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';

var state = {
  config: null, // package init configuration
  error: null, // error from last operation

  tab: false,
  is_loading: false,
  is_session_persistant: true,
  is_authguard_dialog_shown: true, // login dialog
  is_authguard_dialog_persistent: true, // login dialog persistent option
  is_email_verification_link_sent: false, // email verification confirmation
  is_email_reset_password_link_sent: false, // confirmation for successful reset password link email
  is_email_verification_screen_shown: false, // show email verification screen,
  is_reset_password_screen_shown: false, // show reset password screen,
};

var getters = {
  getError: function getError(state) {
    return state.error
  },
  getSessionPersistence: function getSessionPersistence(state) {
    return state.is_session_persistant
  },
  getCurrentUser: function getCurrentUser(state) {
    var ref = state.config;
    var firebase = ref.firebase;
    return firebase.auth().currentUser
  },
  getUid: function getUid(state, getters) {
    var user = getters.getCurrentUser;
    return user ? user.uid : null
  },
  getDisplayName: function getDisplayName(state, getters) {
    var user = getters.getCurrentUser;
    return user ? user.displayName : null
  },
  getEmail: function getEmail(state, getters) {
    var user = getters.getCurrentUser;
    return user ? user.email : null
  },
  getPhotoURL: function getPhotoURL(state, getters) {
    var user = getters.getCurrentUser;
    return user ? user.photoURL : null
  },
  getPhoneNumber: function getPhoneNumber(state, getters) {
    var user = getters.getCurrentUser;
    return user ? user.phoneNumber : null
  },
  getMetadata: function getMetadata(state, getters) {
    var user = getters.getCurrentUser;
    return user ? user.metadata : null
  },
  isLoading: function isLoading(state) {
    return state.is_loading
  },
  isAuthenticated: function isAuthenticated(state, getters) {
    var user = getters.getCurrentUser;
    return user ? true : false
  },
  isAnonymous: function isAnonymous(state, getters) {
    var user = getters.getCurrentUser;
    return user ? user.isAnonymous : null
  },
  isVerified: function isVerified(state, getters) {
    var user = getters.getCurrentUser;
    return user ? user.emailVerified : null
  },
  // check if the current route is public to set negative persisten dialog
  isCurrentRoutePublic: function isCurrentRoutePublic(state) {
    var ref = state.config;
    var router = ref.router;
    var debug = ref.debug;
    var route = router.currentRoute;

    var isPublicRoute = route.matched[0] && typeof route.matched[0].beforeEnter === "undefined" ? true : false;

    if (route.matched[0] && route.matched[0].path !== window.location.pathname) { isPublicRoute = false; }

    if (debug) { console.log("[ auth guard ]: isCurrentRoutePublic: [", isPublicRoute, "]"); }

    return isPublicRoute
  },
  isAuthGuardDialogShown: function isAuthGuardDialogShown(state) {
    return state.is_authguard_dialog_shown
  },
  isAuthGuardDialogPersistent: function isAuthGuardDialogPersistent(state) {
    return state.is_authguard_dialog_persistent
  },
  isUserRegistrationAllowed: function isUserRegistrationAllowed(state) {
    return state.config.registration
  },
  isEmailVerificationRequired: function isEmailVerificationRequired(state) {
    return state.config.verification
  },
  isEmailVerificationScrenShown: function isEmailVerificationScrenShown(state) {
    return state.is_email_verification_screen_shown
  },
  isEmailVerificationLinkSent: function isEmailVerificationLinkSent(state) {
    return state.is_email_verification_link_sent
  },
  isEmailResetPasswordLinkSent: function isEmailResetPasswordLinkSent(state) {
    return state.is_email_reset_password_link_sent
  },
  isResetPasswordScreenShown: function isResetPasswordScreenShown(state) {
    return state.is_reset_password_screen_shown
  },
};

var debug = function () {
  var text = [], len = arguments.length;
  while ( len-- ) text[ len ] = arguments[ len ];

  var ref = Vue.prototype.$authGuardStore.state.auth.config;
  var debug = ref.debug;

  if (!Boolean(debug)) { return }

  console.log.apply(console, text);
};

function authCheck () {
  debug("[ auth check ]: execution started...");

  var allowRoute = false; // default state

  var store = Vue.prototype.$authGuardStore;

  var currentUser = store.getters["auth/getCurrentUser"];
  var isAuthenticated = store.getters["auth/isAuthenticated"];
  var verification = store.state.auth.config.verification;

  if (verification) { debug("[ auth check ]: email verification required: [", verification, "]"); }

  // anonymous authenticated currentUser
  if (verification && currentUser && currentUser.isAnonymous) {
    debug("[ auth check ]: anonymous user BLOCKED unable to verify email!");

    store.commit("auth/SET_AUTH_GUARD_DIALOG_SHOWN", true);
    store.commit("auth/SET_AUTH_GUARD_DIALOG_PERSISTENT", false);
  }

  // authenticated currentUser
  else if (isAuthenticated) {
    debug("[ auth check ]: authenticated currentUser ID: [", currentUser.uid, "]");

    var emailVerified = currentUser.emailVerified || false;
    var domain = currentUser.email ? currentUser.email.split("@")[1] : "";

    debug("[ auth check ]: user email verified: [", emailVerified, "]");

    // check if to show dialog
    allowRoute = emailVerified;

    // check if email verification is always required or for some specific email domain(s) only
    if (verification === false) {
      debug("[ auth check ]: authguard config does not require email verification");

      allowRoute = true;
    } else if (Array.isArray(verification) && !verification.includes(domain)) {
      debug(
        "[ auth check ]: user email domain: [",
        domain,
        "] not included on domain list that requires email verification to authenticate:",
        verification
      );

      allowRoute = true;
    } else {
      debug("[ auth check ]: authguard config requires email verification");
      store.commit("auth/SET_EMAIL_VERIFICATION_SCREEN_SHOWN", true);
    }

    if (allowRoute) {
      store.commit("auth/SET_AUTH_GUARD_DIALOG_SHOWN", false);
      store.commit("auth/SET_AUTH_GUARD_DIALOG_PERSISTENT", false);
    } else {
      store.commit("auth/SET_AUTH_GUARD_DIALOG_SHOWN", true);
      store.commit("auth/SET_AUTH_GUARD_DIALOG_PERSISTENT", true);
    }
  }

  // not authenticated currentUsers get persistent login dialog
  else {
    debug("[ auth check ]: currentUser is NOT authenticated");

    store.commit("auth/SET_AUTH_GUARD_DIALOG_SHOWN", true);
  }

  debug("[ auth check ]:", allowRoute ? "route ALLOWED!" : "route BLOCKED!");

  return allowRoute
}

var actions = {
  revalidateAuthGuard: function revalidateAuthGuard(ref) {
    var state = ref.state;
    var getters = ref.getters;
    var commit = ref.commit;

    var ref$1 = state.config;
    var router = ref$1.router;
    var debug = ref$1.debug;

    if (debug) { console.log("[ auth guard ]: revalidate request after state change"); }

    // check current route when router is ready
    router.onReady(function () {
      if (debug)
        { console.log("[ auth guard ]: vue router ready, isCurrentRoutePublic: [", getters.isCurrentRoutePublic, "]"); }

      if (getters.isCurrentRoutePublic) {
        commit("SET_AUTH_GUARD_DIALOG_SHOWN", false);
        commit("SET_AUTH_GUARD_DIALOG_PERSISTENT", false);
      } else if (!getters.isAuthenticated) {
        if (debug) { console.log("[ auth guard ]: isAuthenticated: [", getters.isAuthenticated, "]"); }

        commit("SET_AUTH_GUARD_DIALOG_SHOWN", true);
        commit("SET_AUTH_GUARD_DIALOG_PERSISTENT", true);
      }
    });
  },

  //
  onAuthStateChanged: function onAuthStateChanged(ref) {
    var state = ref.state;
    var commit = ref.commit;
    var dispatch = ref.dispatch;

    var ref$1 = state.config;
    var firebase = ref$1.firebase;
    var debug = ref$1.debug;

    // important to use onAuthStateChanged to mutate config state
    // in order to prevent vuex from not recognizing firebase changes
    firebase.auth().onAuthStateChanged(function () {
      if (debug) { console.log("[ auth guard ]: firebase auth state changed"); }

      var config = state.config;

      commit("SET_CONFIG", null);
      commit("SET_CONFIG", config);
      commit("SET_EMAIL_VERIFICATION_SCREEN_SHOWN", false);

      authCheck();
      dispatch("revalidateAuthGuard");
    });
  },

  //
  loginWithEmail: function loginWithEmail(ref, ref$1) {
    var state = ref.state;
    var commit = ref.commit;
    var email = ref$1.email;
    var password = ref$1.password;

    return new Promise(async function (resolve, reject) {
      try {
        commit("SET_LOADING", true);

        var ref = state.config;
        var router = ref.router;
        var firebase = ref.firebase;

        // set user session persistance
        // https://firebase.google.com/docs/auth/web/auth-state-persistence
        var persistance = state.is_session_persistant ? "local" : "session";

        await firebase.auth().signOut();
        await firebase.auth().setPersistence(persistance);
        await firebase.auth().signInWithEmailAndPassword(email, password);

        // this is needed to reload route that was not loaded if user was not authenticated
        if (router.currentRoute.name === null) { router.push(router.currentRoute.path); }

        commit("SET_LOADING", false);

        return resolve()
      } catch (error) {
        commit("SET_ERROR", error);
        commit("SET_LOADING", false);

        return reject()
      }
    })
  },

  //
  loginWithGoogle: function loginWithGoogle(ref) {
    var state = ref.state;

    var ref$1 = state.config;
    var firebase = ref$1.firebase;

    var provider = new firebaseProvider.auth.GoogleAuthProvider();

    firebase.auth().useDeviceLanguage();
    firebase.auth().signInWithRedirect(provider);
  },

  //
  loginWithFacebook: function loginWithFacebook(ref) {
    var state = ref.state;

    var ref$1 = state.config;
    var firebase = ref$1.firebase;
    var provider = new firebaseProvider.auth.FacebookAuthProvider();

    firebase.auth().useDeviceLanguage();
    firebase.auth().signInWithRedirect(provider);
  },

  //
  loginWithPhone: function loginWithPhone(ref) {
    var state = ref.state;

    var ref$1 = state.config;
    var firebase = ref$1.firebase;

    // Turn off phone auth app verification.
    firebase.auth().settings.appVerificationDisabledForTesting = true;
  },

  //
  sendCode: function sendCode(ref, ref$1) {
    var this$1$1 = this;
    var state = ref.state;

    var ref$2 = state.config;
    var firebase = ref$2.firebase;

    firebase
      .auth()
      .signInWithPhoneNumber("+1" + phoneNumber, this.recaptchaVerifier)
      .then(function (res) {
        this$1$1.step = 3;
        this$1$1.codeAuth = res;
      })
      .catch(function (error) {
        this$1$1.step = 1;
      });
  },

  //
  confirmCode: function confirmCode() {
    var this$1$1 = this;

    this.codeAuth.confirm(this.confirmationCode).then(function () { return (this$1$1.step = 1); });
  },

  //
  registerUser: async function registerUser(ref, ref$1) {
    var state = ref.state;
    ref.getters;
    var commit = ref.commit;
    var displayName = ref$1.displayName;
    var email = ref$1.email;
    var password = ref$1.password;

    try {
      commit("SET_LOADING", true);

      var ref$2 = state.config;
      var firebase = ref$2.firebase;
      var verification = state.config.email;

      await firebase.auth().createUserWithEmailAndPassword(email, password);
      await firebase.auth().signInWithEmailAndPassword(email, password);
      await firebase.auth().currentUser.updateProfile({ displayName: displayName });

      // send email to verify user email address if config option is not set to false
      if (verification === true || (Array.isArray(verification) && verification.includes(domain))) {
        await firebase.auth().currentUser.sendEmailVerification();
      }

      commit("SET_LOADING", false);
    } catch (error) {
      commit("SET_ERROR", error);
      commit("SET_LOADING", false);
    }
  },

  emailPasswordResetLink: async function emailPasswordResetLink(ref, email) {
    var state = ref.state;
    var commit = ref.commit;

    try {
      commit("SET_LOADING", true);

      var ref$1 = state.config;
      var firebase = ref$1.firebase;

      await firebase.auth().sendPasswordResetEmail(email);

      commit("SET_ERROR", false);
      commit("SET_LOADING", false);
      commit("SET_EMAIL_PASSWORD_RESET_LINK_SENT", true);
    } catch (error) {
      commit("SET_ERROR", error);
      commit("SET_LOADING", false);
    }
  },

  //
  signOut: function signOut(ref) {
    var state = ref.state;

    var ref$1 = state.config;
    var firebase = ref$1.firebase;
    return firebase.auth().signOut()
  },

  //
  sendVerificationEmail: function sendVerificationEmail(ref) {
    var state = ref.state;
    var commit = ref.commit;

    return new Promise(async function (resolve, reject) {
      try {
        commit("SET_LOADING", true);

        var ref = state.config;
        var firebase = ref.firebase;

        await firebase.auth().currentUser.sendEmailVerification();

        commit("SET_LOADING", false);
        commit("SET_EMAIL_VERIFICATION_LINK_SENT", true);

        return resolve()
      } catch (error) {
        commit("SET_ERROR", error);
        commit("SET_LOADING", false);

        return reject()
      }
    })
  },
};

var mutations = {
  SET_TAB: function SET_TAB(state, index) {
    state.tab = index;
  },
  SET_CONFIG: function SET_CONFIG(state, config) {
    state.config = config;
  },
  SET_ERROR: function SET_ERROR(state, error) {
    state.error = error;
  },
  SET_LOADING: function SET_LOADING(state, status) {
    state.is_login = status;
  },
  SET_SESSION_PERSISTANCE: function SET_SESSION_PERSISTANCE(state, status) {
    state.is_session_persistant = status;
  },
  SET_AUTH_GUARD_DIALOG_SHOWN: function SET_AUTH_GUARD_DIALOG_SHOWN(state, status) {
    state.is_authguard_dialog_shown = status;
  },
  SET_AUTH_GUARD_DIALOG_PERSISTENT: function SET_AUTH_GUARD_DIALOG_PERSISTENT(state, status) {
    state.is_authguard_dialog_persistent = status;
  },
  SET_EMAIL_PASSWORD_RESET_LINK_SENT: function SET_EMAIL_PASSWORD_RESET_LINK_SENT(state, status) {
    state.is_email_reset_password_link_sent = status;
  },
  SET_EMAIL_VERIFICATION_LINK_SENT: function SET_EMAIL_VERIFICATION_LINK_SENT(state, status) {
    state.is_email_verification_link_sent = status;
  },
  SET_EMAIL_VERIFICATION_SCREEN_SHOWN: function SET_EMAIL_VERIFICATION_SCREEN_SHOWN(state, status) {
    state.is_email_verification_screen_shown = status;
  },
  SET_PASSWORD_RESET_SCREEN_SHOWN: function SET_PASSWORD_RESET_SCREEN_SHOWN(state, status) {
    state.tab = status ? 1 : 0;
    state.is_reset_password_screen_shown = status;
    if (status === false) { state.is_email_reset_password_link_sent = false; }
  },
};

var AuthStore = {
  namespaced: true,

  state: state,
  getters: getters,
  actions: actions,
  mutations: mutations,
};

var defaultSettings = {
  debug: false,
  store: null, // vuex store
  router: null, // routes
  firebase: null, // pass on firebase middleware app init
  verification: false, // require user email to be verified before granting access
  registration: true, // allow new user registrations
  phone: false, // allow authentication with phone
  google: false, // allow authentication with gmail account
  facebook: false, // allow authentication with facebook account
  title: "Authenticate",
  subtitle: "Firebase Vuetify Authentication NPM package",
  icon: "mdi-brightness-7", // authentication prompt icon
  iconColor: "orange", // authentication prompt icon color
};

var script$6 = {
  components: {
    VIcon: VIcon,
    VListItemTitle: VListItemTitle,
    VListItemSubtitle: VListItemSubtitle,
    VListItemContent: VListItemContent,
    VListItem: VListItem,
    VList: VList
  },

  computed: Object.assign({}, mapState("auth", ["config"]))
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    var options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    var hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
var __vue_script__$6 = script$6;

/* template */
var __vue_render__$6 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "v-list",
    { attrs: { dense: "" } },
    [
      _c(
        "v-list-item",
        [
          _c(
            "v-list-item-content",
            [
              _c(
                "v-list-item-title",
                { staticClass: "title" },
                [
                  _c("v-icon", { attrs: { color: _vm.config.iconColor } }, [
                    _vm._v(_vm._s(_vm.config.icon))
                  ]),
                  _vm._v("\n\n        " + _vm._s(_vm.config.title) + "\n      ")
                ],
                1
              ),
              _vm._v(" "),
              _c("v-list-item-subtitle", [
                _c("div", { staticClass: "ml-1" }, [
                  _vm._v(
                    "\n          " + _vm._s(_vm.config.subtitle) + "\n        "
                  )
                ])
              ])
            ],
            1
          )
        ],
        1
      )
    ],
    1
  )
};
var __vue_staticRenderFns__$6 = [];
__vue_render__$6._withStripped = true;

  /* style */
  var __vue_inject_styles__$6 = undefined;
  /* scoped */
  var __vue_scope_id__$6 = undefined;
  /* module identifier */
  var __vue_module_identifier__$6 = undefined;
  /* functional template */
  var __vue_is_functional_template__$6 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$6 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$6, staticRenderFns: __vue_staticRenderFns__$6 },
    __vue_inject_styles__$6,
    __vue_script__$6,
    __vue_scope_id__$6,
    __vue_is_functional_template__$6,
    __vue_module_identifier__$6,
    false,
    undefined,
    undefined,
    undefined
  );

var script$5 = {
  components: {
    Branding: __vue_component__$6,
    VAlert: VAlert,
    VTextField: VTextField,
    VCheckbox: VCheckbox,
    VCardText: VCardText,
    VBtn: VBtn,
    VCardActions: VCardActions,
    VCard: VCard,
    VContainer: VContainer
  },

  data: function () { return ({
    email: "",
    password: "",
    remember: true,
  }); },

  computed: Object.assign({}, mapGetters("auth", ["getSessionPersistence", "isLoading", "getError"])),

  created: function created() {
    this.remember = this.getSessionPersistence;
    this.SET_EMAIL_PASSWORD_RESET_LINK_SENT(false);
  },

  methods: Object.assign({}, mapActions("auth", ["loginWithEmail"]),
    mapMutations("auth", [
      "SET_SESSION_PERSISTANCE",
      "SET_EMAIL_PASSWORD_RESET_LINK_SENT",
      "SET_PASSWORD_RESET_SCREEN_SHOWN",
      "SET_ERROR" ])),
};

/* script */
var __vue_script__$5 = script$5;

/* template */
var __vue_render__$5 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "v-container",
    [
      _c(
        "v-card",
        { attrs: { flat: "" } },
        [
          Boolean(_vm.getError)
            ? _c(
                "v-alert",
                {
                  attrs: { type: "error", dismissible: "" },
                  on: {
                    click: function($event) {
                      return _vm.SET_ERROR(null)
                    }
                  }
                },
                [_vm._v("\n      " + _vm._s(_vm.getError.message) + "\n    ")]
              )
            : _c("branding", { staticClass: "text-center" }),
          _vm._v(" "),
          _c(
            "v-card-text",
            { staticClass: "mb-0 pb-0" },
            [
              _c("v-text-field", {
                staticClass: "mr-2",
                attrs: {
                  required: "",
                  label: "Email",
                  "prepend-icon": "mdi-account"
                },
                model: {
                  value: _vm.email,
                  callback: function($$v) {
                    _vm.email = $$v;
                  },
                  expression: "email"
                }
              }),
              _vm._v(" "),
              _c("v-text-field", {
                staticClass: "mr-2",
                attrs: {
                  autocomplete: "off",
                  name: "password",
                  type: "password",
                  label: "Password",
                  "prepend-icon": "mdi-lock"
                },
                model: {
                  value: _vm.password,
                  callback: function($$v) {
                    _vm.password = $$v;
                  },
                  expression: "password"
                }
              }),
              _vm._v(" "),
              _c("v-checkbox", {
                staticClass: "ml-8",
                attrs: { dense: "", name: "remember", label: "remember me" },
                on: {
                  change: function($event) {
                    return _vm.SET_SESSION_PERSISTANCE(_vm.remember)
                  }
                },
                model: {
                  value: _vm.remember,
                  callback: function($$v) {
                    _vm.remember = $$v;
                  },
                  expression: "remember"
                }
              })
            ],
            1
          ),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "text-center pb-4" },
            [
              _c(
                "v-btn",
                {
                  attrs: { text: "", "x-small": "", color: "primary" },
                  on: {
                    click: function($event) {
                      return _vm.SET_PASSWORD_RESET_SCREEN_SHOWN(true)
                    }
                  }
                },
                [_vm._v(" Forgot Password? ")]
              )
            ],
            1
          ),
          _vm._v(" "),
          _c(
            "v-card-actions",
            [
              _c(
                "v-btn",
                {
                  attrs: {
                    depressed: "",
                    block: "",
                    large: "",
                    color: "primary",
                    type: "submit",
                    disabled: _vm.isLoading
                  },
                  on: {
                    click: function($event) {
                      return _vm.loginWithEmail({
                        email: _vm.email,
                        password: _vm.password
                      })
                    }
                  }
                },
                [_vm._v("\n        Login\n      ")]
              )
            ],
            1
          )
        ],
        1
      )
    ],
    1
  )
};
var __vue_staticRenderFns__$5 = [];
__vue_render__$5._withStripped = true;

  /* style */
  var __vue_inject_styles__$5 = undefined;
  /* scoped */
  var __vue_scope_id__$5 = undefined;
  /* module identifier */
  var __vue_module_identifier__$5 = undefined;
  /* functional template */
  var __vue_is_functional_template__$5 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$5 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
    __vue_inject_styles__$5,
    __vue_script__$5,
    __vue_scope_id__$5,
    __vue_is_functional_template__$5,
    __vue_module_identifier__$5,
    false,
    undefined,
    undefined,
    undefined
  );

var script$4 = {
  components: {
    Branding: __vue_component__$6,
    VAlert: VAlert,
    VTextField: VTextField,
    VCardText: VCardText,
    VBtn: VBtn,
    VCardActions: VCardActions,
    VForm: VForm,
    VCard: VCard,
    VContainer: VContainer
  },

  data: function () { return ({
    email: "",
    password: "",
    confirm: "",
    displayName: "",
    valid: false,
  }); },

  computed: Object.assign({}, mapGetters("auth", ["isLoading", "getError"]),

    {rules: function rules() {
      var validation = {
        email: this.email == "" ? "Email cannot be empty" : true,
        password: this.password == "" ? "Password cannot be empty" : true,
        displayName: this.displayName == "" ? "Name cannot be empty" : true,
        confirm: this.password !== this.confirm ? "Passwords do not match" : true,
      };

      return validation
    }}),

  methods: Object.assign({}, mapActions("auth", ["registerUser"]),
    mapMutations("auth", ["SET_ERROR"]),

    {register: function register() {
      var ref = this;
      var displayName = ref.displayName;
      var email = ref.email;
      var password = ref.password;
      if (this.$refs.form.validate()) { this.registerUser({ displayName: displayName, email: email, password: password }); }
    }}),
};

/* script */
var __vue_script__$4 = script$4;

/* template */
var __vue_render__$4 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "v-container",
    [
      _c(
        "v-card",
        { attrs: { flat: "" } },
        [
          _c(
            "v-form",
            {
              ref: "form",
              on: {
                submit: function($event) {
                  $event.preventDefault();
                  return _vm.register()
                }
              },
              model: {
                value: _vm.valid,
                callback: function($$v) {
                  _vm.valid = $$v;
                },
                expression: "valid"
              }
            },
            [
              Boolean(_vm.getError)
                ? _c(
                    "v-alert",
                    {
                      attrs: { type: "error", dismissible: "" },
                      on: {
                        click: function($event) {
                          return _vm.SET_ERROR(null)
                        }
                      }
                    },
                    [
                      _vm._v(
                        "\n        " + _vm._s(_vm.getError.message) + "\n      "
                      )
                    ]
                  )
                : _c("branding", { staticClass: "text-center" }),
              _vm._v(" "),
              _c(
                "v-card-text",
                { staticClass: "mb-0 pb-0" },
                [
                  _c("v-text-field", {
                    staticClass: "mr-2",
                    attrs: {
                      required: "",
                      label: "Name",
                      "prepend-icon": "mdi-account",
                      rules: [_vm.rules.displayName]
                    },
                    model: {
                      value: _vm.displayName,
                      callback: function($$v) {
                        _vm.displayName = $$v;
                      },
                      expression: "displayName"
                    }
                  }),
                  _vm._v(" "),
                  _c("v-text-field", {
                    staticClass: "mr-2",
                    attrs: {
                      required: "",
                      label: "Email",
                      "prepend-icon": "mdi-email",
                      rules: [_vm.rules.email]
                    },
                    model: {
                      value: _vm.email,
                      callback: function($$v) {
                        _vm.email = $$v;
                      },
                      expression: "email"
                    }
                  }),
                  _vm._v(" "),
                  _c("v-text-field", {
                    staticClass: "mr-2",
                    attrs: {
                      autocomplete: "off",
                      required: "",
                      type: "password",
                      label: "Password",
                      "prepend-icon": "mdi-lock",
                      rules: [_vm.rules.password]
                    },
                    model: {
                      value: _vm.password,
                      callback: function($$v) {
                        _vm.password = $$v;
                      },
                      expression: "password"
                    }
                  }),
                  _vm._v(" "),
                  _c("v-text-field", {
                    staticClass: "mr-2",
                    attrs: {
                      autocomplete: "off",
                      required: "",
                      type: "password",
                      label: "Confirm password",
                      "prepend-icon": "mdi-lock",
                      rules: [_vm.rules.confirm]
                    },
                    model: {
                      value: _vm.confirm,
                      callback: function($$v) {
                        _vm.confirm = $$v;
                      },
                      expression: "confirm"
                    }
                  })
                ],
                1
              ),
              _vm._v(" "),
              _c(
                "v-card-actions",
                [
                  _c(
                    "v-btn",
                    {
                      attrs: {
                        block: "",
                        large: "",
                        depressed: "",
                        color: "primary",
                        type: "submit",
                        disabled: _vm.isLoading
                      }
                    },
                    [_vm._v(" Register ")]
                  )
                ],
                1
              )
            ],
            1
          )
        ],
        1
      )
    ],
    1
  )
};
var __vue_staticRenderFns__$4 = [];
__vue_render__$4._withStripped = true;

  /* style */
  var __vue_inject_styles__$4 = undefined;
  /* scoped */
  var __vue_scope_id__$4 = undefined;
  /* module identifier */
  var __vue_module_identifier__$4 = undefined;
  /* functional template */
  var __vue_is_functional_template__$4 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$4 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
    __vue_inject_styles__$4,
    __vue_script__$4,
    __vue_scope_id__$4,
    __vue_is_functional_template__$4,
    __vue_module_identifier__$4,
    false,
    undefined,
    undefined,
    undefined
  );

var script$3 = {
  components: {
    Branding: __vue_component__$6,
    VAlert: VAlert,
    VTextField: VTextField,
    VCardText: VCardText,
    VBtn: VBtn,
    VCardActions: VCardActions,
    VContainer: VContainer,
    VForm: VForm,
    VCard: VCard
  },

  data: function () { return ({
    email: "",
    valid: false,
  }); },

  computed: Object.assign({}, mapGetters("auth", ["isLoading", "getError", "isEmailResetPasswordLinkSent"]),

    {rules: function rules() {
      var validation = {
        email: this.email == "" ? "Email cannot be empty" : true,
      };

      return validation
    }}),

  methods: Object.assign({}, mapActions("auth", ["emailPasswordResetLink"]),
    mapMutations("auth", [
      "SET_TAB",
      "SET_ERROR",
      "SET_PASSWORD_RESET_SCREEN_SHOWN",
      "SET_EMAIL_PASSWORD_RESET_LINK_SENT" ])),
};

/* script */
var __vue_script__$3 = script$3;

/* template */
var __vue_render__$3 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "v-container",
    [
      _c(
        "v-card",
        { attrs: { flat: "" } },
        [
          _c(
            "v-form",
            {
              ref: "form",
              on: {
                submit: function($event) {
                  $event.preventDefault();
                  return _vm.emailPasswordResetLink(_vm.email)
                }
              },
              model: {
                value: _vm.valid,
                callback: function($$v) {
                  _vm.valid = $$v;
                },
                expression: "valid"
              }
            },
            [
              Boolean(_vm.getError)
                ? _c(
                    "v-alert",
                    {
                      attrs: { type: "error", dismissible: "" },
                      on: {
                        click: function($event) {
                          return _vm.SET_ERROR(null)
                        }
                      }
                    },
                    [
                      _vm._v(
                        "\n        " + _vm._s(_vm.getError.message) + "\n      "
                      )
                    ]
                  )
                : _c("branding", { staticClass: "text-center" }),
              _vm._v(" "),
              !_vm.isEmailResetPasswordLinkSent
                ? _c(
                    "div",
                    [
                      _c(
                        "v-card-text",
                        { staticClass: "mb-0 pb-0" },
                        [
                          _c("div", { staticClass: "mb-5" }, [
                            _vm._v(
                              "\n            Enter registered user email address and we will send you a link to reset your password.\n          "
                            )
                          ]),
                          _vm._v(" "),
                          _c("v-text-field", {
                            staticClass: "mr-2",
                            attrs: {
                              required: "",
                              error: Boolean(_vm.getError),
                              label: "Email",
                              "prepend-icon": "mdi-account",
                              rules: [_vm.rules.email]
                            },
                            model: {
                              value: _vm.email,
                              callback: function($$v) {
                                _vm.email = $$v;
                              },
                              expression: "email"
                            }
                          })
                        ],
                        1
                      ),
                      _vm._v(" "),
                      _c(
                        "v-card-actions",
                        [
                          _c(
                            "v-btn",
                            {
                              attrs: {
                                block: "",
                                large: "",
                                depressed: "",
                                color: "primary",
                                type: "submit",
                                disabled: _vm.isLoading
                              }
                            },
                            [
                              _vm._v(
                                "\n            Email Password Reset Link\n          "
                              )
                            ]
                          )
                        ],
                        1
                      )
                    ],
                    1
                  )
                : _vm._e(),
              _vm._v(" "),
              _vm.isEmailResetPasswordLinkSent
                ? _c(
                    "v-container",
                    { staticClass: "pa-4 text-center" },
                    [
                      _c("v-card-text", { staticClass: "text-h5" }, [
                        _vm._v(" Email has been sent! ")
                      ]),
                      _vm._v(" "),
                      _c("v-card-text", [
                        _vm._v(
                          "Please check your inbox and follow the instructions in the email to reset your account\n          password"
                        )
                      ]),
                      _vm._v(" "),
                      _c(
                        "v-card-actions",
                        [
                          _c(
                            "v-btn",
                            {
                              attrs: {
                                block: "",
                                large: "",
                                depressed: "",
                                color: "primary"
                              },
                              on: {
                                click: function($event) {
                                  return _vm.SET_PASSWORD_RESET_SCREEN_SHOWN(
                                    false
                                  )
                                }
                              }
                            },
                            [_vm._v(" Login ")]
                          )
                        ],
                        1
                      )
                    ],
                    1
                  )
                : _vm._e()
            ],
            1
          )
        ],
        1
      )
    ],
    1
  )
};
var __vue_staticRenderFns__$3 = [];
__vue_render__$3._withStripped = true;

  /* style */
  var __vue_inject_styles__$3 = undefined;
  /* scoped */
  var __vue_scope_id__$3 = undefined;
  /* module identifier */
  var __vue_module_identifier__$3 = undefined;
  /* functional template */
  var __vue_is_functional_template__$3 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$3 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    false,
    undefined,
    undefined,
    undefined
  );

var script$2 = {
  components: {
    VAlert: VAlert,
    VBtn: VBtn,
    VIcon: VIcon,
    VContainer: VContainer,
    VCard: VCard
  },

  data: function () { return ({}); },

  computed: Object.assign({}, mapState("auth", ["config"]),
    mapGetters("auth", [
      "getError",
      "isLoading",
      "isAuthenticated",
      "isEmailResetPasswordLinkSent",
      "isEmailVerificationLinkSent" ])),

  methods: Object.assign({}, mapActions("auth", ["signIn", "signOut", "sendVerificationEmail"]),
    mapMutations("auth", ["SET_EMAIL_VERIFICATION_SCREEN_SHOWN"]))
};

/* script */
var __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "v-container",
    [
      _c("v-card", { staticClass: "text-center pa-5", attrs: { flat: "" } }, [
        _vm.getError
          ? _c(
              "div",
              [
                _c("div", { staticClass: "display-1 grey--text mb-3" }, [
                  _vm._v("Error!")
                ]),
                _vm._v(" "),
                Boolean(_vm.getError)
                  ? _c(
                      "v-alert",
                      {
                        attrs: { type: "error", dismissible: "" },
                        on: {
                          click: function($event) {
                            return _vm.SET_ERROR(null)
                          }
                        }
                      },
                      [
                        _vm._v(
                          "\n        " +
                            _vm._s(_vm.getError.message) +
                            "\n      "
                        )
                      ]
                    )
                  : _vm._e(),
                _vm._v(" "),
                _c(
                  "v-btn",
                  { attrs: { color: "primary" }, on: { click: _vm.goToLogin } },
                  [_vm._v(" Back to Login ")]
                )
              ],
              1
            )
          : _c(
              "div",
              [
                !_vm.isEmailVerificationLinkSent
                  ? _c(
                      "div",
                      [
                        _c(
                          "div",
                          { staticClass: "display-1 grey--text mb-3" },
                          [_vm._v("Verification Required")]
                        ),
                        _vm._v(" "),
                        _c(
                          "v-icon",
                          {
                            staticClass: "ma-4",
                            attrs: { size: "100", color: "grey" }
                          },
                          [_vm._v("mdi-account")]
                        )
                      ],
                      1
                    )
                  : _vm._e(),
                _vm._v(" "),
                _vm.isEmailVerificationLinkSent
                  ? _c(
                      "div",
                      [
                        _c(
                          "div",
                          { staticClass: "display-1 grey--text mb-3" },
                          [_vm._v("Email sent!")]
                        ),
                        _vm._v(" "),
                        _c(
                          "v-icon",
                          {
                            staticClass: "ma-4",
                            attrs: { size: "100", color: "grey" }
                          },
                          [_vm._v("mdi-email")]
                        )
                      ],
                      1
                    )
                  : _vm._e(),
                _vm._v(" "),
                _c(
                  "div",
                  { staticClass: "grey--text text--darken-2 mb-7 body-2" },
                  [
                    _c("p", [
                      _vm._v(
                        "\n          Please check your email to verify your address. Click at the link in the email we've sent you to confirm\n          your account access.\n        "
                      )
                    ])
                  ]
                ),
                _vm._v(" "),
                !_vm.isEmailResetPasswordLinkSent
                  ? _c(
                      "div",
                      [
                        _c(
                          "p",
                          {
                            staticClass: "grey--text text--darken-2 mb-7 body-2"
                          },
                          [
                            _vm._v(
                              "\n          If you have not received verification email"
                            ),
                            _c("br"),
                            _vm._v("click at the button below.\n        ")
                          ]
                        ),
                        _vm._v(" "),
                        _c(
                          "v-btn",
                          {
                            attrs: {
                              disabled: _vm.isLoading,
                              color: "primary"
                            },
                            on: {
                              click: function($event) {
                                return _vm.sendVerificationEmail()
                              }
                            }
                          },
                          [
                            _vm._v(
                              "\n          Send Verification Email\n        "
                            )
                          ]
                        )
                      ],
                      1
                    )
                  : _vm._e(),
                _vm._v(" "),
                _vm.isEmailResetPasswordLinkSent
                  ? _c(
                      "div",
                      [
                        _c(
                          "v-btn",
                          {
                            attrs: { color: "primary" },
                            on: {
                              click: function($event) {
                                return _vm.SET_EMAIL_VERIFICATION_SCREEN_SHOWN(
                                  false
                                )
                              }
                            }
                          },
                          [_vm._v(" Back to Login ")]
                        )
                      ],
                      1
                    )
                  : _vm._e(),
                _vm._v(" "),
                _c(
                  "v-container",
                  [
                    _c("div", { staticClass: "caption mb-2" }, [
                      _vm._v("- or -")
                    ]),
                    _vm._v(" "),
                    _vm.isAuthenticated
                      ? _c(
                          "v-btn",
                          {
                            attrs: { color: "primary", outlined: "" },
                            on: { click: _vm.signOut }
                          },
                          [_vm._v(" SignOut ")]
                        )
                      : _c(
                          "v-btn",
                          {
                            attrs: { color: "primary", outlined: "" },
                            on: {
                              click: function($event) {
                                return _vm.SET_EMAIL_VERIFICATION_SCREEN_SHOWN(
                                  false
                                )
                              }
                            }
                          },
                          [_vm._v(" SignIn ")]
                        )
                  ],
                  1
                )
              ],
              1
            )
      ])
    ],
    1
  )
};
var __vue_staticRenderFns__$2 = [];
__vue_render__$2._withStripped = true;

  /* style */
  var __vue_inject_styles__$2 = undefined;
  /* scoped */
  var __vue_scope_id__$2 = undefined;
  /* module identifier */
  var __vue_module_identifier__$2 = undefined;
  /* functional template */
  var __vue_is_functional_template__$2 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$2 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    false,
    undefined,
    undefined,
    undefined
  );

var script$1 = {
  components: {
    VIcon: VIcon,
    VBtn: VBtn,
    VTooltip: VTooltip,
    VContainer: VContainer,
    VCardTitle: VCardTitle,
    VTextField: VTextField,
    VCol: VCol,
    VRow: VRow,
    VCardText: VCardText,
    VCard: VCard,
    VDialog: VDialog
  },

  props: ["google", "facebook", "phone"],

  data: function () { return ({
    step: 1,
    valid: false,
    dialog: false,
    codeAuth: null,
    confirmationCode: null,
    codeMask: "######",
    phoneMask: "(###) ###-####",
    phoneNumber: null, // phone number field to send code to
    enterPhoneNumber: false, // show phone number field
    recaptchaVerifier: null,
    recaptchaWidgetId: null,
  }); },

  computed: Object.assign({}, mapState("auth", ["config"]),

    {rules: function rules() {
      var validation = {
        email: this.form.email == "" ? "Email cannot be empty" : true,
        password: this.form.password == "" ? "Password cannot be empty" : true,
      };

      return validation
    },

    firebase: function firebase() {
      return this.config.firebase
    }}),

  mounted: function mounted() {
    // this.recaptchaVerifier = new this.firebase.auth.RecaptchaVerifier("recaptcha-container", { size: "invisible" })
    // this.recaptchaVerifier.render().then((widgetId) => (this.recaptchaWidgetId = widgetId))
  },

  methods: Object.assign({}, mapActions("auth", ["loginWithGoogle", "loginWithFacebook", "loginWithPhone"]))
};

/* script */
var __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _vm.config.google || _vm.config.facebook || _vm.config.phone
    ? _c(
        "v-container",
        { staticClass: "text-center ma-0 pa-0" },
        [
          _c("div", { staticClass: "caption" }, [_vm._v("or login with")]),
          _vm._v(" "),
          _c(
            "v-container",
            [
              _vm.config.google
                ? _c(
                    "v-tooltip",
                    {
                      attrs: { top: "" },
                      scopedSlots: _vm._u(
                        [
                          {
                            key: "activator",
                            fn: function(ref) {
                              var on = ref.on;
                              var attrs = ref.attrs;
                              return [
                                _c(
                                  "v-btn",
                                  _vm._g(
                                    _vm._b(
                                      {
                                        staticClass: "mr-2",
                                        attrs: {
                                          color: "#db3236",
                                          fab: "",
                                          dark: "",
                                          small: ""
                                        },
                                        on: {
                                          click: function($event) {
                                            return _vm.loginWithGoogle()
                                          }
                                        }
                                      },
                                      "v-btn",
                                      attrs,
                                      false
                                    ),
                                    on
                                  ),
                                  [_c("v-icon", [_vm._v("mdi-google")])],
                                  1
                                )
                              ]
                            }
                          }
                        ],
                        null,
                        false,
                        1615720320
                      )
                    },
                    [
                      _vm._v(" "),
                      _c("span", [_vm._v("Authenticate with Gmail Account")])
                    ]
                  )
                : _vm._e(),
              _vm._v(" "),
              _vm.config.facebook
                ? _c(
                    "v-tooltip",
                    {
                      attrs: { top: "" },
                      scopedSlots: _vm._u(
                        [
                          {
                            key: "activator",
                            fn: function(ref) {
                              var on = ref.on;
                              var attrs = ref.attrs;
                              return [
                                _c(
                                  "v-btn",
                                  _vm._g(
                                    _vm._b(
                                      {
                                        staticClass: "mr-2",
                                        attrs: {
                                          color: "#3b5998",
                                          fab: "",
                                          dark: "",
                                          small: ""
                                        },
                                        on: {
                                          click: function($event) {
                                            return _vm.loginWithFacebook()
                                          }
                                        }
                                      },
                                      "v-btn",
                                      attrs,
                                      false
                                    ),
                                    on
                                  ),
                                  [_c("v-icon", [_vm._v("mdi-facebook")])],
                                  1
                                )
                              ]
                            }
                          }
                        ],
                        null,
                        false,
                        1465959198
                      )
                    },
                    [
                      _vm._v(" "),
                      _c("span", [_vm._v("Authenticate with Facebook Account")])
                    ]
                  )
                : _vm._e(),
              _vm._v(" "),
              _vm.config.phone
                ? _c(
                    "v-tooltip",
                    {
                      attrs: { top: "" },
                      scopedSlots: _vm._u(
                        [
                          {
                            key: "activator",
                            fn: function(ref) {
                              var on = ref.on;
                              var attrs = ref.attrs;
                              return [
                                _c(
                                  "v-btn",
                                  _vm._g(
                                    _vm._b(
                                      {
                                        attrs: {
                                          color: "primary",
                                          fab: "",
                                          dark: "",
                                          small: ""
                                        },
                                        on: {
                                          click: function($event) {
                                            return _vm.loginWithPhone()
                                          }
                                        }
                                      },
                                      "v-btn",
                                      attrs,
                                      false
                                    ),
                                    on
                                  ),
                                  [_c("v-icon", [_vm._v("mdi-cellphone")])],
                                  1
                                )
                              ]
                            }
                          }
                        ],
                        null,
                        false,
                        4126551563
                      )
                    },
                    [
                      _vm._v(" "),
                      _c("span", [
                        _vm._v("Authenticate with Text Message To Your Phone")
                      ])
                    ]
                  )
                : _vm._e()
            ],
            1
          ),
          _vm._v(" "),
          _c(
            "v-dialog",
            {
              attrs: { width: "500" },
              model: {
                value: _vm.dialog,
                callback: function($$v) {
                  _vm.dialog = $$v;
                },
                expression: "dialog"
              }
            },
            [
              _c("div", { attrs: { id: "recaptcha-container" } }),
              _vm._v(" "),
              _vm.step === 2
                ? _c(
                    "v-card",
                    [
                      _c(
                        "v-card-title",
                        { staticClass: "body-1 primary white--text" },
                        [_vm._v(" Enter Phone Number ")]
                      ),
                      _vm._v(" "),
                      _c(
                        "v-card-text",
                        [
                          _c(
                            "v-container",
                            { attrs: { fluid: "" } },
                            [
                              _c(
                                "v-row",
                                {
                                  attrs: { align: "center", justify: "center" }
                                },
                                [
                                  _c(
                                    "v-col",
                                    [
                                      _c("v-text-field", {
                                        directives: [
                                          {
                                            name: "mask",
                                            rawName: "v-mask",
                                            value: _vm.phoneMask,
                                            expression: "phoneMask"
                                          }
                                        ],
                                        attrs: {
                                          autocomplete: "off",
                                          label: "Phone Number",
                                          "prepend-icon": "mdi-cellphone"
                                        },
                                        model: {
                                          value: _vm.phoneNumber,
                                          callback: function($$v) {
                                            _vm.phoneNumber = $$v;
                                          },
                                          expression: "phoneNumber"
                                        }
                                      })
                                    ],
                                    1
                                  ),
                                  _vm._v(" "),
                                  _c(
                                    "v-col",
                                    [
                                      _c(
                                        "v-btn",
                                        {
                                          attrs: {
                                            color: "primary",
                                            outlined: "",
                                            disabled: _vm.progress
                                          },
                                          on: {
                                            click: function($event) {
                                              return _vm.sendCode()
                                            }
                                          }
                                        },
                                        [_vm._v(" Send Code ")]
                                      )
                                    ],
                                    1
                                  )
                                ],
                                1
                              )
                            ],
                            1
                          )
                        ],
                        1
                      )
                    ],
                    1
                  )
                : _vm._e(),
              _vm._v(" "),
              _vm.step === 3
                ? _c(
                    "v-card",
                    [
                      _c(
                        "v-card-title",
                        { staticClass: "body-1 primary white--text" },
                        [_vm._v(" Enter Confirm Code ")]
                      ),
                      _vm._v(" "),
                      _c(
                        "v-card-text",
                        [
                          _c(
                            "v-container",
                            { attrs: { fluid: "" } },
                            [
                              _c(
                                "v-row",
                                {
                                  attrs: { align: "center", justify: "center" }
                                },
                                [
                                  _c(
                                    "v-col",
                                    [
                                      _c("v-text-field", {
                                        directives: [
                                          {
                                            name: "mask",
                                            rawName: "v-mask",
                                            value: _vm.codeMask,
                                            expression: "codeMask"
                                          }
                                        ],
                                        attrs: {
                                          autocomplete: "off",
                                          label: "Confirmation Code"
                                        },
                                        model: {
                                          value: _vm.confirmationCode,
                                          callback: function($$v) {
                                            _vm.confirmationCode = $$v;
                                          },
                                          expression: "confirmationCode"
                                        }
                                      })
                                    ],
                                    1
                                  ),
                                  _vm._v(" "),
                                  _c(
                                    "v-col",
                                    [
                                      _c(
                                        "v-btn",
                                        {
                                          attrs: {
                                            color: "primary",
                                            outlined: "",
                                            disabled: _vm.progress
                                          },
                                          on: {
                                            click: function($event) {
                                              return _vm.confirmCode()
                                            }
                                          }
                                        },
                                        [_vm._v(" Confirm Code ")]
                                      )
                                    ],
                                    1
                                  )
                                ],
                                1
                              )
                            ],
                            1
                          )
                        ],
                        1
                      )
                    ],
                    1
                  )
                : _vm._e()
            ],
            1
          )
        ],
        1
      )
    : _vm._e()
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  var __vue_inject_styles__$1 = undefined;
  /* scoped */
  var __vue_scope_id__$1 = undefined;
  /* module identifier */
  var __vue_module_identifier__$1 = undefined;
  /* functional template */
  var __vue_is_functional_template__$1 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$1 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    false,
    undefined,
    undefined,
    undefined
  );

var script = {
  name: "AuthenticationGuard",

  components: {
    Login: __vue_component__$5,
    Register: __vue_component__$4,
    PasswordReset: __vue_component__$3,
    EmailVerification: __vue_component__$2,
    LoginWithProvider: __vue_component__$1,
    VProgressLinear: VProgressLinear,
    VTab: VTab,
    VTabs: VTabs,
    VTabItem: VTabItem,
    VTabsItems: VTabsItems,
    VCardActions: VCardActions,
    VCard: VCard,
    VContainer: VContainer,
    VDialog: VDialog
  },

  data: function () { return ({
    loginError: null,
  }); },

  computed: Object.assign({}, mapState("auth", ["config", "tab"]),
    mapGetters("auth", [
      "isLoading",
      "isAuthenticated",
      "isAuthGuardDialogShown",
      "isAuthGuardDialogPersistent",
      "isUserRegistrationAllowed",
      "isEmailVerificationScrenShown",
      "isResetPasswordScreenShown" ]),

    {currentRoute: function currentRoute() {
      return this.$route.path
    },

    firebase: function firebase() {
      return this.config.firebase
    },

    debug: function debug() {
      return this.config.debug
    }}),

  watch: {
    currentRoute: function currentRoute(after, before) {
      if (typeof before === "undefined") { return }
      if (this.debug) { console.log("[ auth guard ]: vue router current route change: [", before, "] -> [", after, "]"); }

      authCheck();
      this.revalidateAuthGuard();
    },
  },

  created: function created() {
    this.onAuthStateChanged();
  },

  methods: Object.assign({}, mapActions("auth", [
      "onAuthStateChanged",
      "revalidateAuthGuard",
      "loginWithEmail",
      "registerUser",
      "signOut",
      "sendVerificationEmail" ]),
    mapMutations("auth", ["SET_TAB", "SET_USER", "SET_AUTH_GUARD_DIALOG_SHOWN", "SET_PASSWORD_RESET_SCREEN_SHOWN"])),
};

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    [
      _c(
        "v-dialog",
        {
          attrs: {
            value: _vm.isAuthGuardDialogShown,
            persistent: _vm.isAuthGuardDialogPersistent,
            "overlay-opacity": "0.95",
            "content-class": "elevation-0"
          },
          on: {
            input: function($event) {
              return _vm.SET_AUTH_GUARD_DIALOG_SHOWN($event)
            }
          }
        },
        [
          _c(
            "v-container",
            { staticClass: "mb-5", staticStyle: { "max-width": "500px" } },
            [
              _c(
                "v-card",
                { attrs: { flat: "", outlined: "" } },
                [
                  _c("v-progress-linear", {
                    attrs: { indeterminate: _vm.isLoading }
                  }),
                  _vm._v(" "),
                  _vm.isEmailVerificationScrenShown
                    ? _c("div", [_c("EmailVerification")], 1)
                    : _c(
                        "div",
                        [
                          _c(
                            "v-tabs",
                            {
                              attrs: { value: _vm.tab, grow: "" },
                              on: {
                                change: function($event) {
                                  return _vm.SET_TAB($event)
                                }
                              }
                            },
                            [
                              _c(
                                "v-tab",
                                {
                                  on: {
                                    click: function($event) {
                                      _vm.SET_TAB(0);
                                      _vm.SET_PASSWORD_RESET_SCREEN_SHOWN(false);
                                    }
                                  }
                                },
                                [
                                  _vm._v(
                                    "\n              Sign In\n            "
                                  )
                                ]
                              ),
                              _vm._v(" "),
                              !_vm.isResetPasswordScreenShown &&
                              _vm.isUserRegistrationAllowed
                                ? _c("v-tab", [_vm._v(" Register ")])
                                : _vm._e(),
                              _vm._v(" "),
                              _vm.isResetPasswordScreenShown ||
                              !_vm.isUserRegistrationAllowed
                                ? _c("v-tab", [_vm._v(" Reset Password ")])
                                : _vm._e()
                            ],
                            1
                          ),
                          _vm._v(" "),
                          _c(
                            "v-tabs-items",
                            {
                              attrs: { value: _vm.tab },
                              on: {
                                change: function($event) {
                                  return _vm.SET_TAB($event)
                                }
                              }
                            },
                            [
                              _c(
                                "v-tab-item",
                                { staticClass: "pt-5" },
                                [_c("Login")],
                                1
                              ),
                              _vm._v(" "),
                              !_vm.isResetPasswordScreenShown &&
                              _vm.isUserRegistrationAllowed
                                ? _c(
                                    "v-tab-item",
                                    { staticClass: "pt-5" },
                                    [_c("Register")],
                                    1
                                  )
                                : _vm._e(),
                              _vm._v(" "),
                              _vm.isResetPasswordScreenShown ||
                              !_vm.isUserRegistrationAllowed
                                ? _c(
                                    "v-tab-item",
                                    { staticClass: "pt-5" },
                                    [_c("PasswordReset")],
                                    1
                                  )
                                : _vm._e()
                            ],
                            1
                          )
                        ],
                        1
                      ),
                  _vm._v(" "),
                  !_vm.isEmailVerificationScrenShown
                    ? _c("v-card-actions", [_c("LoginWithProvider")], 1)
                    : _vm._e()
                ],
                1
              )
            ],
            1
          )
        ],
        1
      )
    ],
    1
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = undefined;
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    undefined,
    undefined,
    undefined
  );

/**
 * use cases:
 * 1. NOT authenticated user:
 * - user opens app on public route
 * - user opens app on protected route
 * - user navigates from public route to protected route
 *
 * 2. authenticated user, without confirmed email:
 * - user opens app on public route
 * - user opens app on protected route
 * - user navigates from public route to protected route
 * - user navigates from protected route to public route
 *
 * 3. authenticated user with confirmed email
 * - user opens app on public route
 * - user opens app on protected route
 * - user navigates from public route to protected route
 * - user navigates from protected route to public route
 *
 */

function AuthGuardMiddleware (to, from, next) {
  var allowRoute = authCheck();

  return allowRoute ? next() : null
}

// vuex store namespace

// Declare install function executed by Vue.use()
function install(Vue, options) {
  if ( options === void 0 ) options = {};

  if (install.installed) { return }

  install.installed = true;

  // merge default settings with user settings
  var config = Object.assign({}, defaultSettings, options);
  var store = config.store;
  var router = config.router;
  var firebase = config.firebase;

  Vue.prototype.$authGuardStore = store;

  // verify if required dependency instances are passed to this package config
  if (store == null) { console.error("ERROR: vuex store instance missing in AuthenticationGuard config!"); }
  if (router == null) { console.error("ERROR: vue router instance missing in AuthenticationGuard config!"); }
  if (firebase == null) { console.error("ERROR: firebase instance missing in AuthenticationGuard config!"); }

  console.log("!!!!", options);

  // register vuex store namespace
  store.registerModule("auth", AuthStore);

  // commit npm package config to vuex store
  store.commit("auth/SET_CONFIG", config);

  Vue.component("AuthenticationGuard", __vue_component__);
}

// Create module definition for Vue.use()
var plugin = {
  install: install,
};

// Auto-install when vue is found (eg. in browser via <script> tag)
var GlobalVue = null;

if (typeof window !== "undefined") {
  GlobalVue = window.Vue;
} else if (typeof global !== "undefined") {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

var auth = AuthStore; // export vuex store namespace
var AuthMiddleware = AuthGuardMiddleware; // export vue router middleware

export { AuthMiddleware, auth, plugin as default, install };
