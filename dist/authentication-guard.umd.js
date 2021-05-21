(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.AuthenticationGuard = {}, global.vue));
}(this, (function (exports, Vue) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Vue__default = /*#__PURE__*/_interopDefaultLegacy(Vue);

  var this$1 = undefined;

  // https://stackoverflow.com/questions/4116608/pass-unknown-number-of-arguments-into-javascript-function
  function debug () {
    var text = [], len = arguments.length;
    while ( len-- ) text[ len ] = arguments[ len ];

    if (!Boolean(Vue__default['default'].prototype.$authGuardSettings.debug)) { return }

    console.log.apply(this$1, text);
  }

  function authCheck () {
    var allowRoute = false;

    var settings = Vue__default['default'].prototype.$authGuardSettings;
    var firebase = settings.firebase || null;
    var user = firebase.auth().currentUser;
    var isAuthenticated = user && user.uid ? true : false;
    var verification = typeof settings.verification !== "undefined" ? settings.verification : true;

    debug("[ auth guard ]: email verification required: [", verification, "]");

    // anonymous authenticated user
    if (verification && user && user.isAnonymous) {
      debug("[ auth guard ]: anonymous user BLOCKED unable to verify email!");

      Vue__default['default'].prototype.$authGuardSettings.showAuthGuardDialog = true;
      Vue__default['default'].prototype.$authGuardSettings.emailVerificationRequired = false;
    }

    // authenticated user
    else if (isAuthenticated) {
      debug("[ auth guard ]: authenticated user ID:", user.uid);

      var emailVerified = user.emailVerified || false;
      var domain = user.email ? user.email.split("@")[1] : "";

      debug("[ auth guard ]: user email verified: [", emailVerified, "]");

      // check if to show dialog
      allowRoute = emailVerified;

      // check if email verification is always required or for some specific email domain(s) only
      if (verification === false || (Array.isArray(verification) && !verification.includes(domain))) {
        debug("[ auth guard ]: user email verified or does not require verification");

        allowRoute = true;
      }

      // for authenticated use without verified email
      else {
        debug("[ auth guard ]: user email NOT verified");
      }

      if (allowRoute) {
        Vue__default['default'].prototype.$authGuardSettings.showAuthGuardDialog = false;
        Vue__default['default'].prototype.$authGuardSettings.emailVerificationRequired = false;
      } else {
        Vue__default['default'].prototype.$authGuardSettings.showAuthGuardDialog = true;
        Vue__default['default'].prototype.$authGuardSettings.emailVerificationRequired = true;
      }
    }

    // not authenticated users get persistent login dialog
    else {
      debug("[ auth guard ]: user NOT authenticated");

      Vue__default['default'].prototype.$authGuardSettings.showAuthGuardDialog = true;
      Vue__default['default'].prototype.$authGuardSettings.emailVerificationRequired = false;
    }

    /**
     * this has to handle 3 scenarios:
     * - user is on public route and wants to navigate to protected: (1. block nav, 2. show non persistent dialog)
     * - user opens app on protected route: (1. show persistent dialog)
     *
     */

    debug("[ auth check ]:", allowRoute ? "route ALLOWED!" : "route BLOCKED!");

    return allowRoute
  }

  var script$6 = {
    computed: {
      appIcon: function appIcon() {
        return Vue__default['default'].prototype.$authGuardSettings.icon || "mdi-brightness-7"
      },
      appIconColor: function appIconColor() {
        return Vue__default['default'].prototype.$authGuardSettings.iconColor || "orange"
      },
      appTitle: function appTitle() {
        return Vue__default['default'].prototype.$authGuardSettings.title || "Authenticate"
      },
      appSubTitle: function appSubTitle() {
        return Vue__default['default'].prototype.$authGuardSettings.subtitle || "Firebase Vuetify Authentication NPM package"
      },
    },
  };

  var _hoisted_1$6 = { class: "ml-1" };

  function render$6(_ctx, _cache, $props, $setup, $data, $options) {
    var _component_v_icon = Vue.resolveComponent("v-icon");
    var _component_v_list_item_title = Vue.resolveComponent("v-list-item-title");
    var _component_v_list_item_subtitle = Vue.resolveComponent("v-list-item-subtitle");
    var _component_v_list_item_content = Vue.resolveComponent("v-list-item-content");
    var _component_v_list_item = Vue.resolveComponent("v-list-item");
    var _component_v_list = Vue.resolveComponent("v-list");

    return (Vue.openBlock(), Vue.createBlock(_component_v_list, { dense: "" }, {
      default: Vue.withCtx(function () { return [
        Vue.createVNode(_component_v_list_item, null, {
          default: Vue.withCtx(function () { return [
            Vue.createVNode(_component_v_list_item_content, null, {
              default: Vue.withCtx(function () { return [
                Vue.createVNode(_component_v_list_item_title, { class: "title" }, {
                  default: Vue.withCtx(function () { return [
                    Vue.createVNode(_component_v_icon, { color: $options.appIconColor }, {
                      default: Vue.withCtx(function () { return [
                        Vue.createTextVNode(Vue.toDisplayString($options.appIcon), 1 /* TEXT */)
                      ]; }),
                      _: 1 /* STABLE */
                    }, 8 /* PROPS */, ["color"]),
                    Vue.createTextVNode(" " + Vue.toDisplayString($options.appTitle), 1 /* TEXT */)
                  ]; }),
                  _: 1 /* STABLE */
                }),
                Vue.createVNode(_component_v_list_item_subtitle, null, {
                  default: Vue.withCtx(function () { return [
                    Vue.createVNode("div", _hoisted_1$6, Vue.toDisplayString($options.appSubTitle), 1 /* TEXT */)
                  ]; }),
                  _: 1 /* STABLE */
                })
              ]; }),
              _: 1 /* STABLE */
            })
          ]; }),
          _: 1 /* STABLE */
        })
      ]; }),
      _: 1 /* STABLE */
    }))
  }

  script$6.render = render$6;
  script$6.__file = "src/components/authentication/Branding.vue";

  var script$5 = {
    components: { Branding: script$6 },

    props: ["firebase", "error", "isLoading"],

    data: function () { return ({
      form: {
        email: "",
        password: "",
        remember: false,
      },
      valid: false,
    }); },

    computed: {
      rules: function rules() {
        var validation = {
          email: this.form.email == "" ? "Email cannot be empty" : true,
          password: this.form.password == "" ? "Password cannot be empty" : true,
        };

        return validation
      },

      alert: function alert() {
        return Boolean(this.error)
      },
    },

    methods: {
      loginWithEmail: function loginWithEmail() {
        if (this.$refs.form.validate()) {
          this.$emit("credentials", { email: this.form.email, password: this.form.password });
        }
      },
    },
  };

  var _hoisted_1$5 = { class: "text-center pb-4" };
  var _hoisted_2$4 = /*#__PURE__*/Vue.createTextVNode(" Forgot Password? ");
  var _hoisted_3$4 = /*#__PURE__*/Vue.createTextVNode(" Login ");

  function render$5(_ctx, _cache, $props, $setup, $data, $options) {
    var _component_v_alert = Vue.resolveComponent("v-alert");
    var _component_branding = Vue.resolveComponent("branding");
    var _component_v_text_field = Vue.resolveComponent("v-text-field");
    var _component_v_card_text = Vue.resolveComponent("v-card-text");
    var _component_v_btn = Vue.resolveComponent("v-btn");
    var _component_v_card_actions = Vue.resolveComponent("v-card-actions");
    var _component_v_form = Vue.resolveComponent("v-form");
    var _component_v_card = Vue.resolveComponent("v-card");
    var _component_v_container = Vue.resolveComponent("v-container");

    return (Vue.openBlock(), Vue.createBlock(_component_v_container, null, {
      default: Vue.withCtx(function () { return [
        Vue.createVNode(_component_v_card, { flat: "" }, {
          default: Vue.withCtx(function () { return [
            Vue.createVNode(_component_v_form, {
              ref: "form",
              modelValue: _ctx.valid,
              "onUpdate:modelValue": _cache[5] || (_cache[5] = function ($event) { return (_ctx.valid = $event); }),
              onSubmit: Vue.withModifiers($options.loginWithEmail, ["prevent"])
            }, {
              default: Vue.withCtx(function () { return [
                Vue.createCommentVNode(" error alerrts "),
                ($options.alert)
                  ? (Vue.openBlock(), Vue.createBlock(_component_v_alert, {
                      key: 0,
                      modelValue: $options.alert,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = function ($event) { return ($options.alert = $event); }),
                      type: "error",
                      dismissible: ""
                    }, {
                      default: Vue.withCtx(function () { return [
                        Vue.createTextVNode(Vue.toDisplayString($props.error.message), 1 /* TEXT */)
                      ]; }),
                      _: 1 /* STABLE */
                    }, 8 /* PROPS */, ["modelValue"]))
                  : (Vue.openBlock(), Vue.createBlock(Vue.Fragment, { key: 1 }, [
                      Vue.createCommentVNode(" application branding "),
                      Vue.createVNode(_component_branding, { class: "text-center" })
                    ], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */)),
                Vue.createCommentVNode(" login form "),
                Vue.createVNode(_component_v_card_text, { class: "mb-0 pb-0" }, {
                  default: Vue.withCtx(function () { return [
                    Vue.createVNode(_component_v_text_field, {
                      modelValue: _ctx.form.email,
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = function ($event) { return (_ctx.form.email = $event); }),
                      required: "",
                      class: "mr-2",
                      label: "Email",
                      "prepend-icon": "mdi-account",
                      rules: [$options.rules.email]
                    }, null, 8 /* PROPS */, ["modelValue", "rules"]),
                    Vue.createVNode(_component_v_text_field, {
                      modelValue: _ctx.form.password,
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = function ($event) { return (_ctx.form.password = $event); }),
                      autocomplete: "off",
                      class: "mr-2",
                      name: "password",
                      type: "password",
                      label: "Password",
                      "prepend-icon": "mdi-lock",
                      rules: [$options.rules.password]
                    }, null, 8 /* PROPS */, ["modelValue", "rules"]),
                    Vue.createCommentVNode(" <v-checkbox\n\t\t\t\t\t\t\tvalue=\"1\"\n\t\t\t\t\t\t\tname=\"remember\"\n\t\t\t\t\t\t\tclass=\"ml-4 pl-2\"\n\t\t\t\t\t\t\tv-model=\"remember\"\n\t\t\t\t\t\t\tlabel=\"Remember Me\"\n                        />")
                  ]; }),
                  _: 1 /* STABLE */
                }),
                Vue.createVNode("div", _hoisted_1$5, [
                  Vue.createVNode(_component_v_btn, {
                    text: "",
                    "x-small": "",
                    color: "primary",
                    onClick: _cache[4] || (_cache[4] = Vue.withModifiers(function ($event) { return (_ctx.$emit('resetPassword')); }, ["prevent"]))
                  }, {
                    default: Vue.withCtx(function () { return [
                      _hoisted_2$4
                    ]; }),
                    _: 1 /* STABLE */
                  })
                ]),
                Vue.createVNode(_component_v_card_actions, null, {
                  default: Vue.withCtx(function () { return [
                    Vue.createVNode(_component_v_btn, {
                      depressed: "",
                      block: "",
                      large: "",
                      color: "primary",
                      type: "submit",
                      disabled: $props.isLoading
                    }, {
                      default: Vue.withCtx(function () { return [
                        _hoisted_3$4
                      ]; }),
                      _: 1 /* STABLE */
                    }, 8 /* PROPS */, ["disabled"])
                  ]; }),
                  _: 1 /* STABLE */
                })
              ]; }),
              _: 1 /* STABLE */
            }, 8 /* PROPS */, ["modelValue", "onSubmit"])
          ]; }),
          _: 1 /* STABLE */
        })
      ]; }),
      _: 1 /* STABLE */
    }))
  }

  script$5.render = render$5;
  script$5.__file = "src/components/authentication/Login.vue";

  var script$4 = {
    name: "Register",

    components: { Branding: script$6 },

    props: ["error", "isLoading"],

    data: function () { return ({
      form: {
        name: "",
        email: "",
        password: "",
        confirm: "",
        agree: true,
      },
      valid: false,
    }); },

    computed: {
      rules: function rules() {
        var validation = {
          email: this.form.email == "" ? "Email cannot be empty" : true,
          password: this.form.password == "" ? "Password cannot be empty" : true,
          name: this.form.name == "" ? "Name cannot be empty" : true,
          // agree: this.form.agree !== true ? "You must accept Terms of Service to continue" : true,
          confirm: this.form.password !== this.form.confirm ? "Passwords do not match" : true,
        };

        if (this.error) {
          if (this.error.code == "auth/invalid-email") {
            validation.email = this.error.message;
          }
          if (this.error.code == "auth/weak-password") {
            validation.password = this.error.message;
          }
        }

        return validation
      },

      alert: function alert() {
        return Boolean(this.error)
      },
    },

    methods: {
      register: function register() {
        if (this.$refs.form.validate()) {
          this.$emit("registration", this.form);
        }
      },
    },
  };

  var _hoisted_1$4 = /*#__PURE__*/Vue.createTextVNode(" Register ");

  function render$4(_ctx, _cache, $props, $setup, $data, $options) {
    var _component_v_alert = Vue.resolveComponent("v-alert");
    var _component_branding = Vue.resolveComponent("branding");
    var _component_v_text_field = Vue.resolveComponent("v-text-field");
    var _component_v_card_text = Vue.resolveComponent("v-card-text");
    var _component_v_btn = Vue.resolveComponent("v-btn");
    var _component_v_card_actions = Vue.resolveComponent("v-card-actions");
    var _component_v_form = Vue.resolveComponent("v-form");
    var _component_v_card = Vue.resolveComponent("v-card");
    var _component_v_container = Vue.resolveComponent("v-container");

    return (Vue.openBlock(), Vue.createBlock(_component_v_container, null, {
      default: Vue.withCtx(function () { return [
        Vue.createVNode(_component_v_card, { flat: "" }, {
          default: Vue.withCtx(function () { return [
            Vue.createVNode(_component_v_form, {
              ref: "form",
              modelValue: _ctx.valid,
              "onUpdate:modelValue": _cache[6] || (_cache[6] = function ($event) { return (_ctx.valid = $event); }),
              onSubmit: _cache[7] || (_cache[7] = Vue.withModifiers(function ($event) { return ($options.register()); }, ["prevent"]))
            }, {
              default: Vue.withCtx(function () { return [
                Vue.createCommentVNode(" error alerts "),
                ($options.alert)
                  ? (Vue.openBlock(), Vue.createBlock(_component_v_alert, {
                      key: 0,
                      modelValue: $options.alert,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = function ($event) { return ($options.alert = $event); }),
                      type: "error",
                      dismissible: ""
                    }, {
                      default: Vue.withCtx(function () { return [
                        Vue.createTextVNode(Vue.toDisplayString($props.error.message), 1 /* TEXT */)
                      ]; }),
                      _: 1 /* STABLE */
                    }, 8 /* PROPS */, ["modelValue"]))
                  : (Vue.openBlock(), Vue.createBlock(Vue.Fragment, { key: 1 }, [
                      Vue.createCommentVNode(" application branding "),
                      Vue.createVNode(_component_branding, { class: "text-center" })
                    ], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */)),
                Vue.createCommentVNode(" registration form "),
                Vue.createVNode(_component_v_card_text, { class: "mb-0 pb-0" }, {
                  default: Vue.withCtx(function () { return [
                    Vue.createVNode(_component_v_text_field, {
                      modelValue: _ctx.form.name,
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = function ($event) { return (_ctx.form.name = $event); }),
                      required: "",
                      class: "mr-2",
                      label: "Name",
                      "prepend-icon": "mdi-account",
                      rules: [$options.rules.name]
                    }, null, 8 /* PROPS */, ["modelValue", "rules"]),
                    Vue.createVNode(_component_v_text_field, {
                      modelValue: _ctx.form.email,
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = function ($event) { return (_ctx.form.email = $event); }),
                      required: "",
                      class: "mr-2",
                      label: "Email",
                      "prepend-icon": "mdi-email",
                      rules: [$options.rules.email]
                    }, null, 8 /* PROPS */, ["modelValue", "rules"]),
                    Vue.createVNode(_component_v_text_field, {
                      modelValue: _ctx.form.password,
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = function ($event) { return (_ctx.form.password = $event); }),
                      autocomplete: "off",
                      required: "",
                      class: "mr-2",
                      type: "password",
                      label: "Password",
                      "prepend-icon": "mdi-lock",
                      rules: [$options.rules.password]
                    }, null, 8 /* PROPS */, ["modelValue", "rules"]),
                    Vue.createVNode(_component_v_text_field, {
                      modelValue: _ctx.form.confirm,
                      "onUpdate:modelValue": _cache[5] || (_cache[5] = function ($event) { return (_ctx.form.confirm = $event); }),
                      autocomplete: "off",
                      required: "",
                      class: "mr-2",
                      type: "password",
                      label: "Confirm password",
                      "prepend-icon": "mdi-lock",
                      rules: [$options.rules.confirm]
                    }, null, 8 /* PROPS */, ["modelValue", "rules"])
                  ]; }),
                  _: 1 /* STABLE */
                }),
                Vue.createVNode(_component_v_card_actions, null, {
                  default: Vue.withCtx(function () { return [
                    Vue.createVNode(_component_v_btn, {
                      block: "",
                      large: "",
                      depressed: "",
                      color: "primary",
                      type: "submit",
                      disabled: $props.isLoading
                    }, {
                      default: Vue.withCtx(function () { return [
                        _hoisted_1$4
                      ]; }),
                      _: 1 /* STABLE */
                    }, 8 /* PROPS */, ["disabled"])
                  ]; }),
                  _: 1 /* STABLE */
                })
              ]; }),
              _: 1 /* STABLE */
            }, 8 /* PROPS */, ["modelValue"])
          ]; }),
          _: 1 /* STABLE */
        })
      ]; }),
      _: 1 /* STABLE */
    }))
  }

  script$4.render = render$4;
  script$4.__file = "src/components/authentication/Register.vue";

  var script$3 = {
    components: { Branding: script$6 },

    props: ["firebase", "isLoading"],

    data: function () { return ({
      form: {
        email: "",
      },
      error: null,
      valid: false,
      success: false,
    }); },

    computed: {
      rules: function rules() {
        var validation = {
          email: this.form.email == "" ? "Email cannot be empty" : true,
        };

        return validation
      },

      alert: function alert() {
        return Boolean(this.error)
      },
    },

    methods: {
      //
      emailPasswordResetLink: function emailPasswordResetLink() {
        var this$1 = this;

        this.firebase
          .auth()
          .sendPasswordResetEmail(this.form.email)
          .then(function () {
            this$1.error = null;
            this$1.success = true;
          })
          .catch(function (error) {
            this$1.error = error;
            this$1.success = false;
          });
      },
    },
  };

  var _hoisted_1$3 = { key: 2 };
  var _hoisted_2$3 = /*#__PURE__*/Vue.createVNode("div", { class: "mb-5" }, " Enter registered user email address and we will send you a link to reset your password. ", -1 /* HOISTED */);
  var _hoisted_3$3 = /*#__PURE__*/Vue.createTextVNode(" Email Password Reset Link ");
  var _hoisted_4$3 = /*#__PURE__*/Vue.createTextVNode(" Email has been sent! ");
  var _hoisted_5$3 = /*#__PURE__*/Vue.createTextVNode("Please check your inbox and follow the instructions in the email to reset your account password");
  var _hoisted_6$2 = /*#__PURE__*/Vue.createTextVNode(" Login ");

  function render$3(_ctx, _cache, $props, $setup, $data, $options) {
    var _component_v_alert = Vue.resolveComponent("v-alert");
    var _component_branding = Vue.resolveComponent("branding");
    var _component_v_text_field = Vue.resolveComponent("v-text-field");
    var _component_v_card_text = Vue.resolveComponent("v-card-text");
    var _component_v_btn = Vue.resolveComponent("v-btn");
    var _component_v_card_actions = Vue.resolveComponent("v-card-actions");
    var _component_v_container = Vue.resolveComponent("v-container");
    var _component_v_form = Vue.resolveComponent("v-form");
    var _component_v_card = Vue.resolveComponent("v-card");

    return (Vue.openBlock(), Vue.createBlock(_component_v_container, null, {
      default: Vue.withCtx(function () { return [
        Vue.createVNode(_component_v_card, { flat: "" }, {
          default: Vue.withCtx(function () { return [
            Vue.createVNode(_component_v_form, {
              ref: "form",
              modelValue: _ctx.valid,
              "onUpdate:modelValue": _cache[4] || (_cache[4] = function ($event) { return (_ctx.valid = $event); }),
              onSubmit: Vue.withModifiers($options.emailPasswordResetLink, ["prevent"])
            }, {
              default: Vue.withCtx(function () { return [
                Vue.createCommentVNode(" error alerrts "),
                ($options.alert)
                  ? (Vue.openBlock(), Vue.createBlock(_component_v_alert, {
                      key: 0,
                      modelValue: $options.alert,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = function ($event) { return ($options.alert = $event); }),
                      type: "error",
                      dismissible: ""
                    }, {
                      default: Vue.withCtx(function () { return [
                        Vue.createTextVNode(Vue.toDisplayString(_ctx.error.message), 1 /* TEXT */)
                      ]; }),
                      _: 1 /* STABLE */
                    }, 8 /* PROPS */, ["modelValue"]))
                  : (Vue.openBlock(), Vue.createBlock(Vue.Fragment, { key: 1 }, [
                      Vue.createCommentVNode(" application branding "),
                      Vue.createVNode(_component_branding, { class: "text-center" })
                    ], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */)),
                Vue.createCommentVNode(" login form "),
                (!_ctx.success)
                  ? (Vue.openBlock(), Vue.createBlock("div", _hoisted_1$3, [
                      Vue.createVNode(_component_v_card_text, { class: "mb-0 pb-0" }, {
                        default: Vue.withCtx(function () { return [
                          _hoisted_2$3,
                          Vue.createVNode(_component_v_text_field, {
                            modelValue: _ctx.form.email,
                            "onUpdate:modelValue": _cache[2] || (_cache[2] = function ($event) { return (_ctx.form.email = $event); }),
                            required: "",
                            error: $options.alert,
                            class: "mr-2",
                            label: "Email",
                            "prepend-icon": "mdi-account",
                            rules: [$options.rules.email]
                          }, null, 8 /* PROPS */, ["modelValue", "error", "rules"])
                        ]; }),
                        _: 1 /* STABLE */
                      }),
                      Vue.createVNode(_component_v_card_actions, null, {
                        default: Vue.withCtx(function () { return [
                          Vue.createVNode(_component_v_btn, {
                            block: "",
                            large: "",
                            depressed: "",
                            color: "primary",
                            type: "submit",
                            disabled: $props.isLoading
                          }, {
                            default: Vue.withCtx(function () { return [
                              _hoisted_3$3
                            ]; }),
                            _: 1 /* STABLE */
                          }, 8 /* PROPS */, ["disabled"])
                        ]; }),
                        _: 1 /* STABLE */
                      })
                    ]))
                  : Vue.createCommentVNode("v-if", true),
                Vue.createCommentVNode(" success message "),
                (_ctx.success)
                  ? (Vue.openBlock(), Vue.createBlock(_component_v_container, {
                      key: 3,
                      class: "pa-4 text-center"
                    }, {
                      default: Vue.withCtx(function () { return [
                        Vue.createVNode(_component_v_card_text, { class: "text-h5" }, {
                          default: Vue.withCtx(function () { return [
                            _hoisted_4$3
                          ]; }),
                          _: 1 /* STABLE */
                        }),
                        Vue.createVNode(_component_v_card_text, null, {
                          default: Vue.withCtx(function () { return [
                            _hoisted_5$3
                          ]; }),
                          _: 1 /* STABLE */
                        }),
                        Vue.createVNode(_component_v_card_actions, null, {
                          default: Vue.withCtx(function () { return [
                            Vue.createVNode(_component_v_btn, {
                              block: "",
                              large: "",
                              depressed: "",
                              color: "primary",
                              onClick: _cache[3] || (_cache[3] = function ($event) { return (_ctx.$emit('showSignInTab')); })
                            }, {
                              default: Vue.withCtx(function () { return [
                                _hoisted_6$2
                              ]; }),
                              _: 1 /* STABLE */
                            })
                          ]; }),
                          _: 1 /* STABLE */
                        })
                      ]; }),
                      _: 1 /* STABLE */
                    }))
                  : Vue.createCommentVNode("v-if", true)
              ]; }),
              _: 1 /* STABLE */
            }, 8 /* PROPS */, ["modelValue", "onSubmit"])
          ]; }),
          _: 1 /* STABLE */
        })
      ]; }),
      _: 1 /* STABLE */
    }))
  }

  script$3.render = render$3;
  script$3.__file = "src/components/authentication/PasswordReset.vue";

  var script$2 = {
    props: ["error", "isLoading"],

    data: function () { return ({
      emailSent: false,
    }); },

    computed: {
      isAuthenticated: function isAuthenticated() {
        var firebase = this.$authGuardSettings.firebase;
        var user = firebase.auth().currentUser;

        debug("[ EmailVerification.vue isAuthenticated ]:", firebase);

        return user ? true : false
      },
    },

    methods: {
      resendVerificationEmail: function resendVerificationEmail() {
        this.emailSent = true;
        this.$emit("sendEmail");
      },
      goToLogin: function goToLogin() {
        this.$authGuardSettings.emailVerificationRequired = false;
        this.$emit("signOut");
      },
      signIn: function signIn() {
        this.$authGuardSettings.showAuthGuardDialog = true;
        this.$authGuardSettings.emailVerificationRequired = false;
      },
      signOut: function signOut() {
        var firebase = this.$authGuardSettings.firebase;
        firebase.auth().signOut();
        this.$authGuardSettings.showAuthGuardDialog = true;
        this.$authGuardSettings.emailVerificationRequired = false;
      },
    },
  };

  var _hoisted_1$2 = { key: 0 };
  var _hoisted_2$2 = /*#__PURE__*/Vue.createVNode("div", { class: "display-1 grey--text mb-3" }, "Error!", -1 /* HOISTED */);
  var _hoisted_3$2 = /*#__PURE__*/Vue.createTextVNode(" Back to Login ");
  var _hoisted_4$2 = { key: 0 };
  var _hoisted_5$2 = /*#__PURE__*/Vue.createVNode("div", { class: "display-1 grey--text mb-3" }, "Verification Required", -1 /* HOISTED */);
  var _hoisted_6$1 = /*#__PURE__*/Vue.createTextVNode("mdi-account");
  var _hoisted_7$1 = { key: 1 };
  var _hoisted_8$1 = /*#__PURE__*/Vue.createVNode("div", { class: "display-1 grey--text mb-3" }, "Email sent!", -1 /* HOISTED */);
  var _hoisted_9$1 = /*#__PURE__*/Vue.createTextVNode("mdi-email");
  var _hoisted_10$1 = /*#__PURE__*/Vue.createVNode("div", { class: "grey--text text--darken-2 mb-7 body-2" }, [
    /*#__PURE__*/Vue.createVNode("p", null, " Please check your email to verify your address. Click at the link in the email we've sent you to confirm your account access. ")
  ], -1 /* HOISTED */);
  var _hoisted_11$1 = { key: 2 };
  var _hoisted_12$1 = /*#__PURE__*/Vue.createVNode("p", { class: "grey--text text--darken-2 mb-7 body-2" }, [
    /*#__PURE__*/Vue.createTextVNode(" If you have not received verification email"),
    /*#__PURE__*/Vue.createVNode("br"),
    /*#__PURE__*/Vue.createTextVNode("click at the button below. ")
  ], -1 /* HOISTED */);
  var _hoisted_13 = /*#__PURE__*/Vue.createTextVNode(" Send Verification Email ");
  var _hoisted_14 = { key: 3 };
  var _hoisted_15 = /*#__PURE__*/Vue.createTextVNode(" Back to Login ");
  var _hoisted_16 = /*#__PURE__*/Vue.createVNode("div", { class: "caption mb-2" }, "- or -", -1 /* HOISTED */);
  var _hoisted_17 = /*#__PURE__*/Vue.createTextVNode(" SignOut ");
  var _hoisted_18 = /*#__PURE__*/Vue.createTextVNode(" SignIn ");

  function render$2(_ctx, _cache, $props, $setup, $data, $options) {
    var _component_v_alert = Vue.resolveComponent("v-alert");
    var _component_v_btn = Vue.resolveComponent("v-btn");
    var _component_v_icon = Vue.resolveComponent("v-icon");
    var _component_v_container = Vue.resolveComponent("v-container");
    var _component_v_card = Vue.resolveComponent("v-card");

    return (Vue.openBlock(), Vue.createBlock(_component_v_container, null, {
      default: Vue.withCtx(function () { return [
        Vue.createCommentVNode(" user with no email verification "),
        Vue.createVNode(_component_v_card, {
          flat: "",
          class: "text-center pa-5"
        }, {
          default: Vue.withCtx(function () { return [
            Vue.createCommentVNode(" email error "),
            ($props.error)
              ? (Vue.openBlock(), Vue.createBlock("div", _hoisted_1$2, [
                  _hoisted_2$2,
                  ($props.error)
                    ? (Vue.openBlock(), Vue.createBlock(_component_v_alert, {
                        key: 0,
                        type: "error"
                      }, {
                        default: Vue.withCtx(function () { return [
                          Vue.createTextVNode(Vue.toDisplayString($props.error), 1 /* TEXT */)
                        ]; }),
                        _: 1 /* STABLE */
                      }))
                    : Vue.createCommentVNode("v-if", true),
                  Vue.createVNode(_component_v_btn, {
                    color: "primary",
                    onClick: $options.goToLogin
                  }, {
                    default: Vue.withCtx(function () { return [
                      _hoisted_3$2
                    ]; }),
                    _: 1 /* STABLE */
                  }, 8 /* PROPS */, ["onClick"])
                ]))
              : (Vue.openBlock(), Vue.createBlock(Vue.Fragment, { key: 1 }, [
                  Vue.createCommentVNode(" email verification "),
                  Vue.createVNode("div", null, [
                    Vue.createCommentVNode(" email confirmation required message "),
                    (!_ctx.emailSent)
                      ? (Vue.openBlock(), Vue.createBlock("div", _hoisted_4$2, [
                          _hoisted_5$2,
                          Vue.createVNode(_component_v_icon, {
                            size: "100",
                            color: "grey",
                            class: "ma-4"
                          }, {
                            default: Vue.withCtx(function () { return [
                              _hoisted_6$1
                            ]; }),
                            _: 1 /* STABLE */
                          })
                        ]))
                      : Vue.createCommentVNode("v-if", true),
                    Vue.createCommentVNode(" email sent confirmation "),
                    (_ctx.emailSent)
                      ? (Vue.openBlock(), Vue.createBlock("div", _hoisted_7$1, [
                          _hoisted_8$1,
                          Vue.createVNode(_component_v_icon, {
                            size: "100",
                            color: "grey",
                            class: "ma-4"
                          }, {
                            default: Vue.withCtx(function () { return [
                              _hoisted_9$1
                            ]; }),
                            _: 1 /* STABLE */
                          })
                        ]))
                      : Vue.createCommentVNode("v-if", true),
                    _hoisted_10$1,
                    Vue.createCommentVNode(" send verification email button "),
                    (!_ctx.emailSent)
                      ? (Vue.openBlock(), Vue.createBlock("div", _hoisted_11$1, [
                          _hoisted_12$1,
                          Vue.createVNode(_component_v_btn, {
                            disabled: $props.isLoading,
                            color: "primary",
                            onClick: $options.resendVerificationEmail
                          }, {
                            default: Vue.withCtx(function () { return [
                              _hoisted_13
                            ]; }),
                            _: 1 /* STABLE */
                          }, 8 /* PROPS */, ["disabled", "onClick"])
                        ]))
                      : Vue.createCommentVNode("v-if", true),
                    Vue.createCommentVNode(" back to login page button "),
                    (_ctx.emailSent)
                      ? (Vue.openBlock(), Vue.createBlock("div", _hoisted_14, [
                          Vue.createVNode(_component_v_btn, {
                            color: "primary",
                            onClick: $options.goToLogin
                          }, {
                            default: Vue.withCtx(function () { return [
                              _hoisted_15
                            ]; }),
                            _: 1 /* STABLE */
                          }, 8 /* PROPS */, ["onClick"])
                        ]))
                      : Vue.createCommentVNode("v-if", true),
                    Vue.createCommentVNode(" allow to log out in case user cannot confirm the email address "),
                    Vue.createVNode(_component_v_container, null, {
                      default: Vue.withCtx(function () { return [
                        _hoisted_16,
                        ($options.isAuthenticated)
                          ? (Vue.openBlock(), Vue.createBlock(_component_v_btn, {
                              key: 0,
                              color: "primary",
                              outlined: "",
                              onClick: $options.signOut
                            }, {
                              default: Vue.withCtx(function () { return [
                                _hoisted_17
                              ]; }),
                              _: 1 /* STABLE */
                            }, 8 /* PROPS */, ["onClick"]))
                          : (Vue.openBlock(), Vue.createBlock(_component_v_btn, {
                              key: 1,
                              color: "primary",
                              outlined: "",
                              onClick: $options.signIn
                            }, {
                              default: Vue.withCtx(function () { return [
                                _hoisted_18
                              ]; }),
                              _: 1 /* STABLE */
                            }, 8 /* PROPS */, ["onClick"]))
                      ]; }),
                      _: 1 /* STABLE */
                    })
                  ])
                ], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */))
          ]; }),
          _: 1 /* STABLE */
        })
      ]; }),
      _: 1 /* STABLE */
    }))
  }

  script$2.render = render$2;
  script$2.__file = "src/components/authentication/EmailVerification.vue";

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  var __assign$1 = function() {
      __assign$1 = Object.assign || function __assign(t) {
          var arguments$1 = arguments;

          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments$1[i];
              for (var p in s) { if (Object.prototype.hasOwnProperty.call(s, p)) { t[p] = s[p]; } }
          }
          return t;
      };
      return __assign$1.apply(this, arguments);
  };

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) { if (Object.prototype.hasOwnProperty.call(b, p)) { d[p] = b[p]; } } };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      if (typeof b !== "function" && b !== null)
          { throw new TypeError("Class extends value " + String(b) + " is not a constructor or null"); }
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  /**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /**
   * Do a deep-copy of basic JavaScript Objects or Arrays.
   */
  function deepCopy(value) {
      return deepExtend(undefined, value);
  }
  /**
   * Copy properties from source to target (recursively allows extension
   * of Objects and Arrays).  Scalar values in the target are over-written.
   * If target is undefined, an object of the appropriate type will be created
   * (and returned).
   *
   * We recursively copy all child properties of plain Objects in the source- so
   * that namespace- like dictionaries are merged.
   *
   * Note that the target can be a function, in which case the properties in
   * the source Object are copied onto it as static properties of the Function.
   *
   * Note: we don't merge __proto__ to prevent prototype pollution
   */
  function deepExtend(target, source) {
      if (!(source instanceof Object)) {
          return source;
      }
      switch (source.constructor) {
          case Date:
              // Treat Dates like scalars; if the target date object had any child
              // properties - they will be lost!
              var dateValue = source;
              return new Date(dateValue.getTime());
          case Object:
              if (target === undefined) {
                  target = {};
              }
              break;
          case Array:
              // Always copy the array source and overwrite the target.
              target = [];
              break;
          default:
              // Not a plain Object - treat it as a scalar.
              return source;
      }
      for (var prop in source) {
          // use isValidKey to guard against prototype pollution. See https://snyk.io/vuln/SNYK-JS-LODASH-450202
          if (!source.hasOwnProperty(prop) || !isValidKey(prop)) {
              continue;
          }
          target[prop] = deepExtend(target[prop], source[prop]);
      }
      return target;
  }
  function isValidKey(key) {
      return key !== '__proto__';
  }

  /**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var Deferred = /** @class */ (function () {
      function Deferred() {
          var _this = this;
          this.reject = function () { };
          this.resolve = function () { };
          this.promise = new Promise(function (resolve, reject) {
              _this.resolve = resolve;
              _this.reject = reject;
          });
      }
      /**
       * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
       * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
       * and returns a node-style callback which will resolve or reject the Deferred's promise.
       */
      Deferred.prototype.wrapCallback = function (callback) {
          var _this = this;
          return function (error, value) {
              if (error) {
                  _this.reject(error);
              }
              else {
                  _this.resolve(value);
              }
              if (typeof callback === 'function') {
                  // Attaching noop handler just in case developer wasn't expecting
                  // promises
                  _this.promise.catch(function () { });
                  // Some of our callbacks don't expect a value and our own tests
                  // assert that the parameter length is 1
                  if (callback.length === 1) {
                      callback(error);
                  }
                  else {
                      callback(error, value);
                  }
              }
          };
      };
      return Deferred;
  }());
  /**
   * Detect Node.js.
   *
   * @return true if Node.js environment is detected.
   */
  // Node detection logic from: https://github.com/iliakan/detect-node/
  function isNode() {
      try {
          return (Object.prototype.toString.call(global.process) === '[object process]');
      }
      catch (e) {
          return false;
      }
  }
  /**
   * Detect Browser Environment
   */
  function isBrowser() {
      return typeof self === 'object' && self.self === self;
  }

  /**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var ERROR_NAME = 'FirebaseError';
  // Based on code from:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
  var FirebaseError = /** @class */ (function (_super) {
      __extends(FirebaseError, _super);
      function FirebaseError(code, message, customData) {
          var _this = _super.call(this, message) || this;
          _this.code = code;
          _this.customData = customData;
          _this.name = ERROR_NAME;
          // Fix For ES5
          // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
          Object.setPrototypeOf(_this, FirebaseError.prototype);
          // Maintains proper stack trace for where our error was thrown.
          // Only available on V8.
          if (Error.captureStackTrace) {
              Error.captureStackTrace(_this, ErrorFactory.prototype.create);
          }
          return _this;
      }
      return FirebaseError;
  }(Error));
  var ErrorFactory = /** @class */ (function () {
      function ErrorFactory(service, serviceName, errors) {
          this.service = service;
          this.serviceName = serviceName;
          this.errors = errors;
      }
      ErrorFactory.prototype.create = function (code) {
          var arguments$1 = arguments;

          var data = [];
          for (var _i = 1; _i < arguments.length; _i++) {
              data[_i - 1] = arguments$1[_i];
          }
          var customData = data[0] || {};
          var fullCode = this.service + "/" + code;
          var template = this.errors[code];
          var message = template ? replaceTemplate(template, customData) : 'Error';
          // Service Name: Error message (service/code).
          var fullMessage = this.serviceName + ": " + message + " (" + fullCode + ").";
          var error = new FirebaseError(fullCode, fullMessage, customData);
          return error;
      };
      return ErrorFactory;
  }());
  function replaceTemplate(template, data) {
      return template.replace(PATTERN, function (_, key) {
          var value = data[key];
          return value != null ? String(value) : "<" + key + "?>";
      });
  }
  var PATTERN = /\{\$([^}]+)}/g;

  /**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  function contains(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
  }

  /**
   * Helper to make a Subscribe function (just like Promise helps make a
   * Thenable).
   *
   * @param executor Function which can make calls to a single Observer
   *     as a proxy.
   * @param onNoObservers Callback when count of Observers goes to zero.
   */
  function createSubscribe(executor, onNoObservers) {
      var proxy = new ObserverProxy(executor, onNoObservers);
      return proxy.subscribe.bind(proxy);
  }
  /**
   * Implement fan-out for any number of Observers attached via a subscribe
   * function.
   */
  var ObserverProxy = /** @class */ (function () {
      /**
       * @param executor Function which can make calls to a single Observer
       *     as a proxy.
       * @param onNoObservers Callback when count of Observers goes to zero.
       */
      function ObserverProxy(executor, onNoObservers) {
          var _this = this;
          this.observers = [];
          this.unsubscribes = [];
          this.observerCount = 0;
          // Micro-task scheduling by calling task.then().
          this.task = Promise.resolve();
          this.finalized = false;
          this.onNoObservers = onNoObservers;
          // Call the executor asynchronously so subscribers that are called
          // synchronously after the creation of the subscribe function
          // can still receive the very first value generated in the executor.
          this.task
              .then(function () {
              executor(_this);
          })
              .catch(function (e) {
              _this.error(e);
          });
      }
      ObserverProxy.prototype.next = function (value) {
          this.forEachObserver(function (observer) {
              observer.next(value);
          });
      };
      ObserverProxy.prototype.error = function (error) {
          this.forEachObserver(function (observer) {
              observer.error(error);
          });
          this.close(error);
      };
      ObserverProxy.prototype.complete = function () {
          this.forEachObserver(function (observer) {
              observer.complete();
          });
          this.close();
      };
      /**
       * Subscribe function that can be used to add an Observer to the fan-out list.
       *
       * - We require that no event is sent to a subscriber sychronously to their
       *   call to subscribe().
       */
      ObserverProxy.prototype.subscribe = function (nextOrObserver, error, complete) {
          var _this = this;
          var observer;
          if (nextOrObserver === undefined &&
              error === undefined &&
              complete === undefined) {
              throw new Error('Missing Observer.');
          }
          // Assemble an Observer object when passed as callback functions.
          if (implementsAnyMethods(nextOrObserver, [
              'next',
              'error',
              'complete'
          ])) {
              observer = nextOrObserver;
          }
          else {
              observer = {
                  next: nextOrObserver,
                  error: error,
                  complete: complete
              };
          }
          if (observer.next === undefined) {
              observer.next = noop;
          }
          if (observer.error === undefined) {
              observer.error = noop;
          }
          if (observer.complete === undefined) {
              observer.complete = noop;
          }
          var unsub = this.unsubscribeOne.bind(this, this.observers.length);
          // Attempt to subscribe to a terminated Observable - we
          // just respond to the Observer with the final error or complete
          // event.
          if (this.finalized) {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              this.task.then(function () {
                  try {
                      if (_this.finalError) {
                          observer.error(_this.finalError);
                      }
                      else {
                          observer.complete();
                      }
                  }
                  catch (e) {
                      // nothing
                  }
                  return;
              });
          }
          this.observers.push(observer);
          return unsub;
      };
      // Unsubscribe is synchronous - we guarantee that no events are sent to
      // any unsubscribed Observer.
      ObserverProxy.prototype.unsubscribeOne = function (i) {
          if (this.observers === undefined || this.observers[i] === undefined) {
              return;
          }
          delete this.observers[i];
          this.observerCount -= 1;
          if (this.observerCount === 0 && this.onNoObservers !== undefined) {
              this.onNoObservers(this);
          }
      };
      ObserverProxy.prototype.forEachObserver = function (fn) {
          if (this.finalized) {
              // Already closed by previous event....just eat the additional values.
              return;
          }
          // Since sendOne calls asynchronously - there is no chance that
          // this.observers will become undefined.
          for (var i = 0; i < this.observers.length; i++) {
              this.sendOne(i, fn);
          }
      };
      // Call the Observer via one of it's callback function. We are careful to
      // confirm that the observe has not been unsubscribed since this asynchronous
      // function had been queued.
      ObserverProxy.prototype.sendOne = function (i, fn) {
          var _this = this;
          // Execute the callback asynchronously
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.task.then(function () {
              if (_this.observers !== undefined && _this.observers[i] !== undefined) {
                  try {
                      fn(_this.observers[i]);
                  }
                  catch (e) {
                      // Ignore exceptions raised in Observers or missing methods of an
                      // Observer.
                      // Log error to console. b/31404806
                      if (typeof console !== 'undefined' && console.error) {
                          console.error(e);
                      }
                  }
              }
          });
      };
      ObserverProxy.prototype.close = function (err) {
          var _this = this;
          if (this.finalized) {
              return;
          }
          this.finalized = true;
          if (err !== undefined) {
              this.finalError = err;
          }
          // Proxy is no longer needed - garbage collect references
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.task.then(function () {
              _this.observers = undefined;
              _this.onNoObservers = undefined;
          });
      };
      return ObserverProxy;
  }());
  /**
   * Return true if the object passed in implements any of the named methods.
   */
  function implementsAnyMethods(obj, methods) {
      if (typeof obj !== 'object' || obj === null) {
          return false;
      }
      for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
          var method = methods_1[_i];
          if (method in obj && typeof obj[method] === 'function') {
              return true;
          }
      }
      return false;
  }
  function noop() {
      // do nothing
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          var arguments$1 = arguments;

          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments$1[i];
              for (var p in s) { if (Object.prototype.hasOwnProperty.call(s, p)) { t[p] = s[p]; } }
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };

  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  function __generator(thisArg, body) {
      var _ = { label: 0, sent: function() { if (t[0] & 1) { throw t[1]; } return t[1]; }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function (v) { return step([n, v]); }; }
      function step(op) {
          if (f) { throw new TypeError("Generator is already executing."); }
          while (_) { try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) { return t; }
              if (y = 0, t) { op = [op[0] & 2, t.value]; }
              switch (op[0]) {
                  case 0: case 1: t = op; break;
                  case 4: _.label++; return { value: op[1], done: false };
                  case 5: _.label++; y = op[1]; op = [0]; continue;
                  case 7: op = _.ops.pop(); _.trys.pop(); continue;
                  default:
                      if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                      if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                      if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                      if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                      if (t[2]) { _.ops.pop(); }
                      _.trys.pop(); continue;
              }
              op = body.call(thisArg, _);
          } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; } }
          if (op[0] & 5) { throw op[1]; } return { value: op[0] ? op[1] : void 0, done: true };
      }
  }

  function __values(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m) { return m.call(o); }
      if (o && typeof o.length === "number") { return {
          next: function () {
              if (o && i >= o.length) { o = void 0; }
              return { value: o && o[i++], done: !o };
          }
      }; }
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }

  function __read(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) { return o; }
      var i = m.call(o), r, ar = [], e;
      try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) { ar.push(r.value); }
      }
      catch (error) { e = { error: error }; }
      finally {
          try {
              if (r && !r.done && (m = i["return"])) { m.call(i); }
          }
          finally { if (e) { throw e.error; } }
      }
      return ar;
  }

  function __spreadArray(to, from) {
      for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
          { to[j] = from[i]; }
      return to;
  }

  /**
   * Component for service name T, e.g. `auth`, `auth-internal`
   */
  var Component = /** @class */ (function () {
      /**
       *
       * @param name The public service name, e.g. app, auth, firestore, database
       * @param instanceFactory Service factory responsible for creating the public interface
       * @param type whether the service provided by the component is public or private
       */
      function Component(name, instanceFactory, type) {
          this.name = name;
          this.instanceFactory = instanceFactory;
          this.type = type;
          this.multipleInstances = false;
          /**
           * Properties to be added to the service namespace
           */
          this.serviceProps = {};
          this.instantiationMode = "LAZY" /* LAZY */;
          this.onInstanceCreated = null;
      }
      Component.prototype.setInstantiationMode = function (mode) {
          this.instantiationMode = mode;
          return this;
      };
      Component.prototype.setMultipleInstances = function (multipleInstances) {
          this.multipleInstances = multipleInstances;
          return this;
      };
      Component.prototype.setServiceProps = function (props) {
          this.serviceProps = props;
          return this;
      };
      Component.prototype.setInstanceCreatedCallback = function (callback) {
          this.onInstanceCreated = callback;
          return this;
      };
      return Component;
  }());

  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var DEFAULT_ENTRY_NAME$1 = '[DEFAULT]';

  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /**
   * Provider for instance for service name T, e.g. 'auth', 'auth-internal'
   * NameServiceMapping[T] is an alias for the type of the instance
   */
  var Provider = /** @class */ (function () {
      function Provider(name, container) {
          this.name = name;
          this.container = container;
          this.component = null;
          this.instances = new Map();
          this.instancesDeferred = new Map();
          this.onInitCallbacks = new Set();
      }
      /**
       * @param identifier A provider can provide mulitple instances of a service
       * if this.component.multipleInstances is true.
       */
      Provider.prototype.get = function (identifier) {
          if (identifier === void 0) { identifier = DEFAULT_ENTRY_NAME$1; }
          // if multipleInstances is not supported, use the default name
          var normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
          if (!this.instancesDeferred.has(normalizedIdentifier)) {
              var deferred = new Deferred();
              this.instancesDeferred.set(normalizedIdentifier, deferred);
              if (this.isInitialized(normalizedIdentifier) ||
                  this.shouldAutoInitialize()) {
                  // initialize the service if it can be auto-initialized
                  try {
                      var instance = this.getOrInitializeService({
                          instanceIdentifier: normalizedIdentifier
                      });
                      if (instance) {
                          deferred.resolve(instance);
                      }
                  }
                  catch (e) {
                      // when the instance factory throws an exception during get(), it should not cause
                      // a fatal error. We just return the unresolved promise in this case.
                  }
              }
          }
          return this.instancesDeferred.get(normalizedIdentifier).promise;
      };
      Provider.prototype.getImmediate = function (options) {
          var _a = __assign({ identifier: DEFAULT_ENTRY_NAME$1, optional: false }, options), identifier = _a.identifier, optional = _a.optional;
          // if multipleInstances is not supported, use the default name
          var normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
          if (this.isInitialized(normalizedIdentifier) ||
              this.shouldAutoInitialize()) {
              try {
                  return this.getOrInitializeService({
                      instanceIdentifier: normalizedIdentifier
                  });
              }
              catch (e) {
                  if (optional) {
                      return null;
                  }
                  else {
                      throw e;
                  }
              }
          }
          else {
              // In case a component is not initialized and should/can not be auto-initialized at the moment, return null if the optional flag is set, or throw
              if (optional) {
                  return null;
              }
              else {
                  throw Error("Service " + this.name + " is not available");
              }
          }
      };
      Provider.prototype.getComponent = function () {
          return this.component;
      };
      Provider.prototype.setComponent = function (component) {
          var e_1, _a;
          if (component.name !== this.name) {
              throw Error("Mismatching Component " + component.name + " for Provider " + this.name + ".");
          }
          if (this.component) {
              throw Error("Component for " + this.name + " has already been provided");
          }
          this.component = component;
          // return early without attempting to initialize the component if the component requires explicit initialization (calling `Provider.initialize()`)
          if (!this.shouldAutoInitialize()) {
              return;
          }
          // if the service is eager, initialize the default instance
          if (isComponentEager(component)) {
              try {
                  this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME$1 });
              }
              catch (e) {
                  // when the instance factory for an eager Component throws an exception during the eager
                  // initialization, it should not cause a fatal error.
                  // TODO: Investigate if we need to make it configurable, because some component may want to cause
                  // a fatal error in this case?
              }
          }
          try {
              // Create service instances for the pending promises and resolve them
              // NOTE: if this.multipleInstances is false, only the default instance will be created
              // and all promises with resolve with it regardless of the identifier.
              for (var _b = __values(this.instancesDeferred.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                  var _d = __read(_c.value, 2), instanceIdentifier = _d[0], instanceDeferred = _d[1];
                  var normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
                  try {
                      // `getOrInitializeService()` should always return a valid instance since a component is guaranteed. use ! to make typescript happy.
                      var instance = this.getOrInitializeService({
                          instanceIdentifier: normalizedIdentifier
                      });
                      instanceDeferred.resolve(instance);
                  }
                  catch (e$1) {
                      // when the instance factory throws an exception, it should not cause
                      // a fatal error. We just leave the promise unresolved.
                  }
              }
          }
          catch (e_1_1) { e_1 = { error: e_1_1 }; }
          finally {
              try {
                  if (_c && !_c.done && (_a = _b.return)) { _a.call(_b); }
              }
              finally { if (e_1) { throw e_1.error; } }
          }
      };
      Provider.prototype.clearInstance = function (identifier) {
          if (identifier === void 0) { identifier = DEFAULT_ENTRY_NAME$1; }
          this.instancesDeferred.delete(identifier);
          this.instances.delete(identifier);
      };
      // app.delete() will call this method on every provider to delete the services
      // TODO: should we mark the provider as deleted?
      Provider.prototype.delete = function () {
          return __awaiter(this, void 0, void 0, function () {
              var services;
              return __generator(this, function (_a) {
                  switch (_a.label) {
                      case 0:
                          services = Array.from(this.instances.values());
                          return [4 /*yield*/, Promise.all(__spreadArray(__spreadArray([], __read(services
                                  .filter(function (service) { return 'INTERNAL' in service; }) // legacy services
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  .map(function (service) { return service.INTERNAL.delete(); }))), __read(services
                                  .filter(function (service) { return '_delete' in service; }) // modularized services
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  .map(function (service) { return service._delete(); }))))];
                      case 1:
                          _a.sent();
                          return [2 /*return*/];
                  }
              });
          });
      };
      Provider.prototype.isComponentSet = function () {
          return this.component != null;
      };
      Provider.prototype.isInitialized = function (identifier) {
          if (identifier === void 0) { identifier = DEFAULT_ENTRY_NAME$1; }
          return this.instances.has(identifier);
      };
      Provider.prototype.initialize = function (opts) {
          var e_2, _a;
          if (opts === void 0) { opts = {}; }
          var _b = opts.instanceIdentifier, instanceIdentifier = _b === void 0 ? DEFAULT_ENTRY_NAME$1 : _b, _c = opts.options, options = _c === void 0 ? {} : _c;
          var normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
          if (this.isInitialized(normalizedIdentifier)) {
              throw Error(this.name + "(" + normalizedIdentifier + ") has already been initialized");
          }
          if (!this.isComponentSet()) {
              throw Error("Component " + this.name + " has not been registered yet");
          }
          var instance = this.getOrInitializeService({
              instanceIdentifier: normalizedIdentifier,
              options: options
          });
          try {
              // resolve any pending promise waiting for the service instance
              for (var _d = __values(this.instancesDeferred.entries()), _e = _d.next(); !_e.done; _e = _d.next()) {
                  var _f = __read(_e.value, 2), instanceIdentifier_1 = _f[0], instanceDeferred = _f[1];
                  var normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier_1);
                  if (normalizedIdentifier === normalizedDeferredIdentifier) {
                      instanceDeferred.resolve(instance);
                  }
              }
          }
          catch (e_2_1) { e_2 = { error: e_2_1 }; }
          finally {
              try {
                  if (_e && !_e.done && (_a = _d.return)) { _a.call(_d); }
              }
              finally { if (e_2) { throw e_2.error; } }
          }
          this.invokeOnInitCallbacks(instance, normalizedIdentifier);
          return instance;
      };
      /**
       *
       * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
       * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
       *
       * @returns a function to unregister the callback
       */
      Provider.prototype.onInit = function (callback) {
          var _this = this;
          this.onInitCallbacks.add(callback);
          return function () {
              _this.onInitCallbacks.delete(callback);
          };
      };
      /**
       * Invoke onInit callbacks synchronously
       * @param instance the service instance`
       */
      Provider.prototype.invokeOnInitCallbacks = function (instance, identifier) {
          var e_3, _a;
          try {
              for (var _b = __values(this.onInitCallbacks), _c = _b.next(); !_c.done; _c = _b.next()) {
                  var callback = _c.value;
                  try {
                      callback(instance, identifier);
                  }
                  catch (_d) {
                      // ignore errors in the onInit callback
                  }
              }
          }
          catch (e_3_1) { e_3 = { error: e_3_1 }; }
          finally {
              try {
                  if (_c && !_c.done && (_a = _b.return)) { _a.call(_b); }
              }
              finally { if (e_3) { throw e_3.error; } }
          }
      };
      Provider.prototype.getOrInitializeService = function (_a) {
          var instanceIdentifier = _a.instanceIdentifier, _b = _a.options, options = _b === void 0 ? {} : _b;
          var instance = this.instances.get(instanceIdentifier);
          if (!instance && this.component) {
              instance = this.component.instanceFactory(this.container, {
                  instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
                  options: options
              });
              this.instances.set(instanceIdentifier, instance);
              /**
               * Order is important
               * onInstanceCreated() should be called after this.instances.set(instanceIdentifier, instance); which
               * makes `isInitialized()` return true.
               */
              if (this.component.onInstanceCreated) {
                  try {
                      this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
                  }
                  catch (_c) {
                      // ignore errors in the onInstanceCreatedCallback
                  }
              }
          }
          return instance || null;
      };
      Provider.prototype.normalizeInstanceIdentifier = function (identifier) {
          if (this.component) {
              return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME$1;
          }
          else {
              return identifier; // assume multiple instances are supported before the component is provided.
          }
      };
      Provider.prototype.shouldAutoInitialize = function () {
          return (!!this.component &&
              this.component.instantiationMode !== "EXPLICIT" /* EXPLICIT */);
      };
      return Provider;
  }());
  // undefined should be passed to the service factory for the default instance
  function normalizeIdentifierForFactory(identifier) {
      return identifier === DEFAULT_ENTRY_NAME$1 ? undefined : identifier;
  }
  function isComponentEager(component) {
      return component.instantiationMode === "EAGER" /* EAGER */;
  }

  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /**
   * ComponentContainer that provides Providers for service name T, e.g. `auth`, `auth-internal`
   */
  var ComponentContainer = /** @class */ (function () {
      function ComponentContainer(name) {
          this.name = name;
          this.providers = new Map();
      }
      /**
       *
       * @param component Component being added
       * @param overwrite When a component with the same name has already been registered,
       * if overwrite is true: overwrite the existing component with the new component and create a new
       * provider with the new component. It can be useful in tests where you want to use different mocks
       * for different tests.
       * if overwrite is false: throw an exception
       */
      ComponentContainer.prototype.addComponent = function (component) {
          var provider = this.getProvider(component.name);
          if (provider.isComponentSet()) {
              throw new Error("Component " + component.name + " has already been registered with " + this.name);
          }
          provider.setComponent(component);
      };
      ComponentContainer.prototype.addOrOverwriteComponent = function (component) {
          var provider = this.getProvider(component.name);
          if (provider.isComponentSet()) {
              // delete the existing provider from the container, so we can register the new component
              this.providers.delete(component.name);
          }
          this.addComponent(component);
      };
      /**
       * getProvider provides a type safe interface where it can only be called with a field name
       * present in NameServiceMapping interface.
       *
       * Firebase SDKs providing services should extend NameServiceMapping interface to register
       * themselves.
       */
      ComponentContainer.prototype.getProvider = function (name) {
          if (this.providers.has(name)) {
              return this.providers.get(name);
          }
          // create a Provider for a service that hasn't registered with Firebase
          var provider = new Provider(name, this);
          this.providers.set(name, provider);
          return provider;
      };
      ComponentContainer.prototype.getProviders = function () {
          return Array.from(this.providers.values());
      };
      return ComponentContainer;
  }());

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __spreadArrays() {
      var arguments$1 = arguments;

      for (var s = 0, i = 0, il = arguments.length; i < il; i++) { s += arguments$1[i].length; }
      for (var r = Array(s), k = 0, i = 0; i < il; i++)
          { for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
              { r[k] = a[j]; } }
      return r;
  }

  /**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var _a$2;
  /**
   * A container for all of the Logger instances
   */
  var instances = [];
  /**
   * The JS SDK supports 5 log levels and also allows a user the ability to
   * silence the logs altogether.
   *
   * The order is a follows:
   * DEBUG < VERBOSE < INFO < WARN < ERROR
   *
   * All of the log types above the current log level will be captured (i.e. if
   * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
   * `VERBOSE` logs will not)
   */
  var LogLevel;
  (function (LogLevel) {
      LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
      LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
      LogLevel[LogLevel["INFO"] = 2] = "INFO";
      LogLevel[LogLevel["WARN"] = 3] = "WARN";
      LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
      LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
  })(LogLevel || (LogLevel = {}));
  var levelStringToEnum = {
      'debug': LogLevel.DEBUG,
      'verbose': LogLevel.VERBOSE,
      'info': LogLevel.INFO,
      'warn': LogLevel.WARN,
      'error': LogLevel.ERROR,
      'silent': LogLevel.SILENT
  };
  /**
   * The default log level
   */
  var defaultLogLevel = LogLevel.INFO;
  /**
   * By default, `console.debug` is not displayed in the developer console (in
   * chrome). To avoid forcing users to have to opt-in to these logs twice
   * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
   * logs to the `console.log` function.
   */
  var ConsoleMethod = (_a$2 = {},
      _a$2[LogLevel.DEBUG] = 'log',
      _a$2[LogLevel.VERBOSE] = 'log',
      _a$2[LogLevel.INFO] = 'info',
      _a$2[LogLevel.WARN] = 'warn',
      _a$2[LogLevel.ERROR] = 'error',
      _a$2);
  /**
   * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
   * messages on to their corresponding console counterparts (if the log method
   * is supported by the current log level)
   */
  var defaultLogHandler = function (instance, logType) {
      var arguments$1 = arguments;

      var args = [];
      for (var _i = 2; _i < arguments.length; _i++) {
          args[_i - 2] = arguments$1[_i];
      }
      if (logType < instance.logLevel) {
          return;
      }
      var now = new Date().toISOString();
      var method = ConsoleMethod[logType];
      if (method) {
          console[method].apply(console, __spreadArrays(["[" + now + "]  " + instance.name + ":"], args));
      }
      else {
          throw new Error("Attempted to log a message with an invalid logType (value: " + logType + ")");
      }
  };
  var Logger = /** @class */ (function () {
      /**
       * Gives you an instance of a Logger to capture messages according to
       * Firebase's logging scheme.
       *
       * @param name The name that the logs will be associated with
       */
      function Logger(name) {
          this.name = name;
          /**
           * The log level of the given Logger instance.
           */
          this._logLevel = defaultLogLevel;
          /**
           * The main (internal) log handler for the Logger instance.
           * Can be set to a new function in internal package code but not by user.
           */
          this._logHandler = defaultLogHandler;
          /**
           * The optional, additional, user-defined log handler for the Logger instance.
           */
          this._userLogHandler = null;
          /**
           * Capture the current instance for later use
           */
          instances.push(this);
      }
      Object.defineProperty(Logger.prototype, "logLevel", {
          get: function () {
              return this._logLevel;
          },
          set: function (val) {
              if (!(val in LogLevel)) {
                  throw new TypeError("Invalid value \"" + val + "\" assigned to `logLevel`");
              }
              this._logLevel = val;
          },
          enumerable: false,
          configurable: true
      });
      // Workaround for setter/getter having to be the same type.
      Logger.prototype.setLogLevel = function (val) {
          this._logLevel = typeof val === 'string' ? levelStringToEnum[val] : val;
      };
      Object.defineProperty(Logger.prototype, "logHandler", {
          get: function () {
              return this._logHandler;
          },
          set: function (val) {
              if (typeof val !== 'function') {
                  throw new TypeError('Value assigned to `logHandler` must be a function');
              }
              this._logHandler = val;
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(Logger.prototype, "userLogHandler", {
          get: function () {
              return this._userLogHandler;
          },
          set: function (val) {
              this._userLogHandler = val;
          },
          enumerable: false,
          configurable: true
      });
      /**
       * The functions below are all based on the `console` interface
       */
      Logger.prototype.debug = function () {
          var arguments$1 = arguments;

          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments$1[_i];
          }
          this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays([this, LogLevel.DEBUG], args));
          this._logHandler.apply(this, __spreadArrays([this, LogLevel.DEBUG], args));
      };
      Logger.prototype.log = function () {
          var arguments$1 = arguments;

          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments$1[_i];
          }
          this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays([this, LogLevel.VERBOSE], args));
          this._logHandler.apply(this, __spreadArrays([this, LogLevel.VERBOSE], args));
      };
      Logger.prototype.info = function () {
          var arguments$1 = arguments;

          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments$1[_i];
          }
          this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays([this, LogLevel.INFO], args));
          this._logHandler.apply(this, __spreadArrays([this, LogLevel.INFO], args));
      };
      Logger.prototype.warn = function () {
          var arguments$1 = arguments;

          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments$1[_i];
          }
          this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays([this, LogLevel.WARN], args));
          this._logHandler.apply(this, __spreadArrays([this, LogLevel.WARN], args));
      };
      Logger.prototype.error = function () {
          var arguments$1 = arguments;

          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments$1[_i];
          }
          this._userLogHandler && this._userLogHandler.apply(this, __spreadArrays([this, LogLevel.ERROR], args));
          this._logHandler.apply(this, __spreadArrays([this, LogLevel.ERROR], args));
      };
      return Logger;
  }());
  function setLogLevel(level) {
      instances.forEach(function (inst) {
          inst.setLogLevel(level);
      });
  }
  function setUserLogHandler(logCallback, options) {
      var _loop_1 = function (instance) {
          var customLogLevel = null;
          if (options && options.level) {
              customLogLevel = levelStringToEnum[options.level];
          }
          if (logCallback === null) {
              instance.userLogHandler = null;
          }
          else {
              instance.userLogHandler = function (instance, level) {
                  var arguments$1 = arguments;

                  var args = [];
                  for (var _i = 2; _i < arguments.length; _i++) {
                      args[_i - 2] = arguments$1[_i];
                  }
                  var message = args
                      .map(function (arg) {
                      if (arg == null) {
                          return null;
                      }
                      else if (typeof arg === 'string') {
                          return arg;
                      }
                      else if (typeof arg === 'number' || typeof arg === 'boolean') {
                          return arg.toString();
                      }
                      else if (arg instanceof Error) {
                          return arg.message;
                      }
                      else {
                          try {
                              return JSON.stringify(arg);
                          }
                          catch (ignored) {
                              return null;
                          }
                      }
                  })
                      .filter(function (arg) { return arg; })
                      .join(' ');
                  if (level >= (customLogLevel !== null && customLogLevel !== void 0 ? customLogLevel : instance.logLevel)) {
                      logCallback({
                          level: LogLevel[level].toLowerCase(),
                          message: message,
                          args: args,
                          type: instance.name
                      });
                  }
              };
          }
      };
      for (var _i = 0, instances_1 = instances; _i < instances_1.length; _i++) {
          var instance = instances_1[_i];
          _loop_1(instance);
      }
  }

  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var _a;
  var ERRORS = (_a = {},
      _a["no-app" /* NO_APP */] = "No Firebase App '{$appName}' has been created - " +
          'call Firebase App.initializeApp()',
      _a["bad-app-name" /* BAD_APP_NAME */] = "Illegal App name: '{$appName}",
      _a["duplicate-app" /* DUPLICATE_APP */] = "Firebase App named '{$appName}' already exists",
      _a["app-deleted" /* APP_DELETED */] = "Firebase App named '{$appName}' already deleted",
      _a["invalid-app-argument" /* INVALID_APP_ARGUMENT */] = 'firebase.{$appName}() takes either no argument or a ' +
          'Firebase App instance.',
      _a["invalid-log-argument" /* INVALID_LOG_ARGUMENT */] = 'First argument to `onLog` must be null or a function.',
      _a);
  var ERROR_FACTORY = new ErrorFactory('app', 'Firebase', ERRORS);

  var name$1 = "@firebase/app";
  var version$1 = "0.6.22";

  var name$1$1 = "@firebase/analytics";

  var name$2 = "@firebase/app-check";

  var name$3 = "@firebase/auth";

  var name$4 = "@firebase/database";

  var name$5 = "@firebase/functions";

  var name$6 = "@firebase/installations";

  var name$7 = "@firebase/messaging";

  var name$8 = "@firebase/performance";

  var name$9 = "@firebase/remote-config";

  var name$a = "@firebase/storage";

  var name$b = "@firebase/firestore";

  var name$c = "firebase-wrapper";

  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var _a$1;
  var DEFAULT_ENTRY_NAME = '[DEFAULT]';
  var PLATFORM_LOG_STRING = (_a$1 = {},
      _a$1[name$1] = 'fire-core',
      _a$1[name$1$1] = 'fire-analytics',
      _a$1[name$2] = 'fire-app-check',
      _a$1[name$3] = 'fire-auth',
      _a$1[name$4] = 'fire-rtdb',
      _a$1[name$5] = 'fire-fn',
      _a$1[name$6] = 'fire-iid',
      _a$1[name$7] = 'fire-fcm',
      _a$1[name$8] = 'fire-perf',
      _a$1[name$9] = 'fire-rc',
      _a$1[name$a] = 'fire-gcs',
      _a$1[name$b] = 'fire-fst',
      _a$1['fire-js'] = 'fire-js',
      _a$1[name$c] = 'fire-js-all',
      _a$1);

  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var logger = new Logger('@firebase/app');

  /**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /**
   * Global context object for a collection of services using
   * a shared authentication state.
   */
  var FirebaseAppImpl = /** @class */ (function () {
      function FirebaseAppImpl(options, config, firebase_) {
          var _this = this;
          this.firebase_ = firebase_;
          this.isDeleted_ = false;
          this.name_ = config.name;
          this.automaticDataCollectionEnabled_ =
              config.automaticDataCollectionEnabled || false;
          this.options_ = deepCopy(options);
          this.container = new ComponentContainer(config.name);
          // add itself to container
          this._addComponent(new Component('app', function () { return _this; }, "PUBLIC" /* PUBLIC */));
          // populate ComponentContainer with existing components
          this.firebase_.INTERNAL.components.forEach(function (component) {
              return _this._addComponent(component);
          });
      }
      Object.defineProperty(FirebaseAppImpl.prototype, "automaticDataCollectionEnabled", {
          get: function () {
              this.checkDestroyed_();
              return this.automaticDataCollectionEnabled_;
          },
          set: function (val) {
              this.checkDestroyed_();
              this.automaticDataCollectionEnabled_ = val;
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(FirebaseAppImpl.prototype, "name", {
          get: function () {
              this.checkDestroyed_();
              return this.name_;
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(FirebaseAppImpl.prototype, "options", {
          get: function () {
              this.checkDestroyed_();
              return this.options_;
          },
          enumerable: false,
          configurable: true
      });
      FirebaseAppImpl.prototype.delete = function () {
          var _this = this;
          return new Promise(function (resolve) {
              _this.checkDestroyed_();
              resolve();
          })
              .then(function () {
              _this.firebase_.INTERNAL.removeApp(_this.name_);
              return Promise.all(_this.container.getProviders().map(function (provider) { return provider.delete(); }));
          })
              .then(function () {
              _this.isDeleted_ = true;
          });
      };
      /**
       * Return a service instance associated with this app (creating it
       * on demand), identified by the passed instanceIdentifier.
       *
       * NOTE: Currently storage and functions are the only ones that are leveraging this
       * functionality. They invoke it by calling:
       *
       * ```javascript
       * firebase.app().storage('STORAGE BUCKET ID')
       * ```
       *
       * The service name is passed to this already
       * @internal
       */
      FirebaseAppImpl.prototype._getService = function (name, instanceIdentifier) {
          var _a;
          if (instanceIdentifier === void 0) { instanceIdentifier = DEFAULT_ENTRY_NAME; }
          this.checkDestroyed_();
          // Initialize instance if InstatiationMode is `EXPLICIT`.
          var provider = this.container.getProvider(name);
          if (!provider.isInitialized() &&
              ((_a = provider.getComponent()) === null || _a === void 0 ? void 0 : _a.instantiationMode) === "EXPLICIT" /* EXPLICIT */) {
              provider.initialize();
          }
          // getImmediate will always succeed because _getService is only called for registered components.
          return provider.getImmediate({
              identifier: instanceIdentifier
          });
      };
      /**
       * Remove a service instance from the cache, so we will create a new instance for this service
       * when people try to get this service again.
       *
       * NOTE: currently only firestore is using this functionality to support firestore shutdown.
       *
       * @param name The service name
       * @param instanceIdentifier instance identifier in case multiple instances are allowed
       * @internal
       */
      FirebaseAppImpl.prototype._removeServiceInstance = function (name, instanceIdentifier) {
          if (instanceIdentifier === void 0) { instanceIdentifier = DEFAULT_ENTRY_NAME; }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.container.getProvider(name).clearInstance(instanceIdentifier);
      };
      /**
       * @param component the component being added to this app's container
       */
      FirebaseAppImpl.prototype._addComponent = function (component) {
          try {
              this.container.addComponent(component);
          }
          catch (e) {
              logger.debug("Component " + component.name + " failed to register with FirebaseApp " + this.name, e);
          }
      };
      FirebaseAppImpl.prototype._addOrOverwriteComponent = function (component) {
          this.container.addOrOverwriteComponent(component);
      };
      FirebaseAppImpl.prototype.toJSON = function () {
          return {
              name: this.name,
              automaticDataCollectionEnabled: this.automaticDataCollectionEnabled,
              options: this.options
          };
      };
      /**
       * This function will throw an Error if the App has already been deleted -
       * use before performing API actions on the App.
       */
      FirebaseAppImpl.prototype.checkDestroyed_ = function () {
          if (this.isDeleted_) {
              throw ERROR_FACTORY.create("app-deleted" /* APP_DELETED */, { appName: this.name_ });
          }
      };
      return FirebaseAppImpl;
  }());
  // Prevent dead-code elimination of these methods w/o invalid property
  // copying.
  (FirebaseAppImpl.prototype.name && FirebaseAppImpl.prototype.options) ||
      FirebaseAppImpl.prototype.delete ||
      console.log('dc');

  var version$1$1 = "8.6.1";

  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /**
   * Because auth can't share code with other components, we attach the utility functions
   * in an internal namespace to share code.
   * This function return a firebase namespace object without
   * any utility functions, so it can be shared between the regular firebaseNamespace and
   * the lite version.
   */
  function createFirebaseNamespaceCore(firebaseAppImpl) {
      var apps = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      var components = new Map();
      // A namespace is a plain JavaScript Object.
      var namespace = {
          // Hack to prevent Babel from modifying the object returned
          // as the firebase namespace.
          // @ts-ignore
          __esModule: true,
          initializeApp: initializeApp,
          // @ts-ignore
          app: app,
          registerVersion: registerVersion,
          setLogLevel: setLogLevel,
          onLog: onLog,
          // @ts-ignore
          apps: null,
          SDK_VERSION: version$1$1,
          INTERNAL: {
              registerComponent: registerComponent,
              removeApp: removeApp,
              components: components,
              useAsService: useAsService
          }
      };
      // Inject a circular default export to allow Babel users who were previously
      // using:
      //
      //   import firebase from 'firebase';
      //   which becomes: var firebase = require('firebase').default;
      //
      // instead of
      //
      //   import * as firebase from 'firebase';
      //   which becomes: var firebase = require('firebase');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      namespace['default'] = namespace;
      // firebase.apps is a read-only getter.
      Object.defineProperty(namespace, 'apps', {
          get: getApps
      });
      /**
       * Called by App.delete() - but before any services associated with the App
       * are deleted.
       */
      function removeApp(name) {
          delete apps[name];
      }
      /**
       * Get the App object for a given name (or DEFAULT).
       */
      function app(name) {
          name = name || DEFAULT_ENTRY_NAME;
          if (!contains(apps, name)) {
              throw ERROR_FACTORY.create("no-app" /* NO_APP */, { appName: name });
          }
          return apps[name];
      }
      // @ts-ignore
      app['App'] = firebaseAppImpl;
      function initializeApp(options, rawConfig) {
          if (rawConfig === void 0) { rawConfig = {}; }
          if (typeof rawConfig !== 'object' || rawConfig === null) {
              var name_1 = rawConfig;
              rawConfig = { name: name_1 };
          }
          var config = rawConfig;
          if (config.name === undefined) {
              config.name = DEFAULT_ENTRY_NAME;
          }
          var name = config.name;
          if (typeof name !== 'string' || !name) {
              throw ERROR_FACTORY.create("bad-app-name" /* BAD_APP_NAME */, {
                  appName: String(name)
              });
          }
          if (contains(apps, name)) {
              throw ERROR_FACTORY.create("duplicate-app" /* DUPLICATE_APP */, { appName: name });
          }
          var app = new firebaseAppImpl(options, config, namespace);
          apps[name] = app;
          return app;
      }
      /*
       * Return an array of all the non-deleted FirebaseApps.
       */
      function getApps() {
          // Make a copy so caller cannot mutate the apps list.
          return Object.keys(apps).map(function (name) { return apps[name]; });
      }
      function registerComponent(component) {
          var componentName = component.name;
          if (components.has(componentName)) {
              logger.debug("There were multiple attempts to register component " + componentName + ".");
              return component.type === "PUBLIC" /* PUBLIC */
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      namespace[componentName]
                  : null;
          }
          components.set(componentName, component);
          // create service namespace for public components
          if (component.type === "PUBLIC" /* PUBLIC */) {
              // The Service namespace is an accessor function ...
              var serviceNamespace = function (appArg) {
                  if (appArg === void 0) { appArg = app(); }
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  if (typeof appArg[componentName] !== 'function') {
                      // Invalid argument.
                      // This happens in the following case: firebase.storage('gs:/')
                      throw ERROR_FACTORY.create("invalid-app-argument" /* INVALID_APP_ARGUMENT */, {
                          appName: componentName
                      });
                  }
                  // Forward service instance lookup to the FirebaseApp.
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  return appArg[componentName]();
              };
              // ... and a container for service-level properties.
              if (component.serviceProps !== undefined) {
                  deepExtend(serviceNamespace, component.serviceProps);
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              namespace[componentName] = serviceNamespace;
              // Patch the FirebaseAppImpl prototype
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              firebaseAppImpl.prototype[componentName] =
                  // TODO: The eslint disable can be removed and the 'ignoreRestArgs'
                  // option added to the no-explicit-any rule when ESlint releases it.
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  function () {
                      var arguments$1 = arguments;

                      var args = [];
                      for (var _i = 0; _i < arguments.length; _i++) {
                          args[_i] = arguments$1[_i];
                      }
                      var serviceFxn = this._getService.bind(this, componentName);
                      return serviceFxn.apply(this, component.multipleInstances ? args : []);
                  };
          }
          // add the component to existing app instances
          for (var _i = 0, _a = Object.keys(apps); _i < _a.length; _i++) {
              var appName = _a[_i];
              apps[appName]._addComponent(component);
          }
          return component.type === "PUBLIC" /* PUBLIC */
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  namespace[componentName]
              : null;
      }
      function registerVersion(libraryKeyOrName, version, variant) {
          var _a;
          // TODO: We can use this check to whitelist strings when/if we set up
          // a good whitelist system.
          var library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
          if (variant) {
              library += "-" + variant;
          }
          var libraryMismatch = library.match(/\s|\//);
          var versionMismatch = version.match(/\s|\//);
          if (libraryMismatch || versionMismatch) {
              var warning = [
                  "Unable to register library \"" + library + "\" with version \"" + version + "\":"
              ];
              if (libraryMismatch) {
                  warning.push("library name \"" + library + "\" contains illegal characters (whitespace or \"/\")");
              }
              if (libraryMismatch && versionMismatch) {
                  warning.push('and');
              }
              if (versionMismatch) {
                  warning.push("version name \"" + version + "\" contains illegal characters (whitespace or \"/\")");
              }
              logger.warn(warning.join(' '));
              return;
          }
          registerComponent(new Component(library + "-version", function () { return ({ library: library, version: version }); }, "VERSION" /* VERSION */));
      }
      function onLog(logCallback, options) {
          if (logCallback !== null && typeof logCallback !== 'function') {
              throw ERROR_FACTORY.create("invalid-log-argument" /* INVALID_LOG_ARGUMENT */);
          }
          setUserLogHandler(logCallback, options);
      }
      // Map the requested service to a registered service name
      // (used to map auth to serverAuth service when needed).
      function useAsService(app, name) {
          if (name === 'serverAuth') {
              return null;
          }
          var useService = name;
          return useService;
      }
      return namespace;
  }

  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /**
   * Return a firebase namespace object.
   *
   * In production, this will be called exactly once and the result
   * assigned to the 'firebase' global.  It may be called multiple times
   * in unit tests.
   */
  function createFirebaseNamespace() {
      var namespace = createFirebaseNamespaceCore(FirebaseAppImpl);
      namespace.INTERNAL = __assign$1(__assign$1({}, namespace.INTERNAL), { createFirebaseNamespace: createFirebaseNamespace,
          extendNamespace: extendNamespace,
          createSubscribe: createSubscribe,
          ErrorFactory: ErrorFactory,
          deepExtend: deepExtend });
      /**
       * Patch the top-level firebase namespace with additional properties.
       *
       * firebase.INTERNAL.extendNamespace()
       */
      function extendNamespace(props) {
          deepExtend(namespace, props);
      }
      return namespace;
  }
  var firebase = createFirebaseNamespace();

  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var PlatformLoggerService = /** @class */ (function () {
      function PlatformLoggerService(container) {
          this.container = container;
      }
      // In initial implementation, this will be called by installations on
      // auth token refresh, and installations will send this string.
      PlatformLoggerService.prototype.getPlatformInfoString = function () {
          var providers = this.container.getProviders();
          // Loop through providers and get library/version pairs from any that are
          // version components.
          return providers
              .map(function (provider) {
              if (isVersionServiceProvider(provider)) {
                  var service = provider.getImmediate();
                  return service.library + "/" + service.version;
              }
              else {
                  return null;
              }
          })
              .filter(function (logString) { return logString; })
              .join(' ');
      };
      return PlatformLoggerService;
  }());
  /**
   *
   * @param provider check if this provider provides a VersionService
   *
   * NOTE: Using Provider<'app-version'> is a hack to indicate that the provider
   * provides VersionService. The provider is not necessarily a 'app-version'
   * provider.
   */
  function isVersionServiceProvider(provider) {
      var component = provider.getComponent();
      return (component === null || component === void 0 ? void 0 : component.type) === "VERSION" /* VERSION */;
  }

  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  function registerCoreComponents(firebase, variant) {
      firebase.INTERNAL.registerComponent(new Component('platform-logger', function (container) { return new PlatformLoggerService(container); }, "PRIVATE" /* PRIVATE */));
      // Register `app` package.
      firebase.registerVersion(name$1, version$1, variant);
      // Register platform SDK identifier (no version).
      firebase.registerVersion('fire-js', '');
  }

  /**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  // Firebase Lite detection test
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (isBrowser() && self.firebase !== undefined) {
      logger.warn("\n    Warning: Firebase is already defined in the global scope. Please make sure\n    Firebase library is only loaded once.\n  ");
      // eslint-disable-next-line
      var sdkVersion = self.firebase.SDK_VERSION;
      if (sdkVersion && sdkVersion.indexOf('LITE') >= 0) {
          logger.warn("\n    Warning: You are trying to load Firebase while using Firebase Performance standalone script.\n    You should load Firebase Performance with this instance of Firebase to avoid loading duplicate code.\n    ");
      }
  }
  var initializeApp = firebase.initializeApp;
  // TODO: This disable can be removed and the 'ignoreRestArgs' option added to
  // the no-explicit-any rule when ESlint releases it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  firebase.initializeApp = function () {
      var arguments$1 = arguments;

      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments$1[_i];
      }
      // Environment check before initializing app
      // Do the check in initializeApp, so people have a chance to disable it by setting logLevel
      // in @firebase/logger
      if (isNode()) {
          logger.warn("\n      Warning: This is a browser-targeted Firebase bundle but it appears it is being\n      run in a Node environment.  If running in a Node environment, make sure you\n      are using the bundle specified by the \"main\" field in package.json.\n      \n      If you are using Webpack, you can specify \"main\" as the first item in\n      \"resolve.mainFields\":\n      https://webpack.js.org/configuration/resolve/#resolvemainfields\n      \n      If using Rollup, use the @rollup/plugin-node-resolve plugin and specify \"main\"\n      as the first item in \"mainFields\", e.g. ['main', 'module'].\n      https://github.com/rollup/@rollup/plugin-node-resolve\n      ");
      }
      return initializeApp.apply(undefined, args);
  };
  var firebase$1 = firebase;
  registerCoreComponents(firebase$1);

  var name = "firebase";
  var version = "8.6.1";

  /**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  firebase$1.registerVersion(name, version, 'app');

  var script$1 = {
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

    computed: {
      rules: function rules() {
        var validation = {
          email: this.form.email == "" ? "Email cannot be empty" : true,
          password: this.form.password == "" ? "Password cannot be empty" : true,
        };

        return validation
      },

      firebase: function firebase() {
        return Vue__default['default'].prototype.$authGuardSettings.firebase
      },
    },

    mounted: function mounted() {
      // this.recaptchaVerifier = new this.firebase.auth.RecaptchaVerifier("recaptcha-container", { size: "invisible" })
      // // render the rapchaVerifier.
      // this.recaptchaVerifier.render().then(widgetId => (this.recaptchaWidgetId = widgetId))
    },

    methods: {
      loginWith: function loginWith() {
        this.step = 1;
        this.dialog = true;
      },

      loginWithGoogle: function loginWithGoogle() {
        var provider = new firebase$1.auth.GoogleAuthProvider();

        // add custom scopes
        provider.addScope("https://www.googleapis.com/auth/adwords");
        provider.addScope("https://www.googleapis.com/auth/analytics.readonly");

        this.firebase.auth().useDeviceLanguage();
        this.firebase.auth().signInWithRedirect(provider);
      },

      loginWithPhone: function loginWithPhone() {
        // Turn off phone auth app verification.
        this.firebase.auth().settings.appVerificationDisabledForTesting = true;

        // switch dialog to allow entering mobile phone number
        this.step = 2;
      },

      sendCode: function sendCode() {
        var this$1 = this;

        this.firebase
          .auth()
          .signInWithPhoneNumber("+1" + this.phoneNumber, this.recaptchaVerifier)
          .then(function (res) {
            this$1.step = 3;
            this$1.codeAuth = res;
          })
          .catch(function (error) {
            this$1.step = 1;
          });
      },

      confirmCode: function confirmCode() {
        var this$1 = this;

        this.codeAuth.confirm(this.confirmationCode).then(function () { return (this$1.step = 1); });
      },
    },
  };

  var _hoisted_1$1 = /*#__PURE__*/Vue.createVNode("div", { class: "caption" }, "or login with", -1 /* HOISTED */);
  var _hoisted_2$1 = /*#__PURE__*/Vue.createTextVNode("mdi-google");
  var _hoisted_3$1 = /*#__PURE__*/Vue.createVNode("span", null, "Google Gmail Account", -1 /* HOISTED */);
  var _hoisted_4$1 = /*#__PURE__*/Vue.createTextVNode("mdi-facebook");
  var _hoisted_5$1 = /*#__PURE__*/Vue.createVNode("span", null, "Facebook Account", -1 /* HOISTED */);
  var _hoisted_6 = /*#__PURE__*/Vue.createTextVNode("mdi-cellphone");
  var _hoisted_7 = /*#__PURE__*/Vue.createVNode("span", null, "Text Message To Your Phone", -1 /* HOISTED */);
  var _hoisted_8 = /*#__PURE__*/Vue.createVNode("div", { id: "recaptcha-container" }, null, -1 /* HOISTED */);
  var _hoisted_9 = /*#__PURE__*/Vue.createTextVNode(" Enter Phone Number ");
  var _hoisted_10 = /*#__PURE__*/Vue.createTextVNode(" Send Code ");
  var _hoisted_11 = /*#__PURE__*/Vue.createTextVNode(" Enter Confirm Code ");
  var _hoisted_12 = /*#__PURE__*/Vue.createTextVNode(" Confirm Code ");

  function render$1(_ctx, _cache, $props, $setup, $data, $options) {
    var _component_v_icon = Vue.resolveComponent("v-icon");
    var _component_v_btn = Vue.resolveComponent("v-btn");
    var _component_v_tooltip = Vue.resolveComponent("v-tooltip");
    var _component_v_container = Vue.resolveComponent("v-container");
    var _component_v_card_title = Vue.resolveComponent("v-card-title");
    var _component_v_text_field = Vue.resolveComponent("v-text-field");
    var _component_v_col = Vue.resolveComponent("v-col");
    var _component_v_row = Vue.resolveComponent("v-row");
    var _component_v_card_text = Vue.resolveComponent("v-card-text");
    var _component_v_card = Vue.resolveComponent("v-card");
    var _component_v_dialog = Vue.resolveComponent("v-dialog");
    var _directive_mask = Vue.resolveDirective("mask");

    return ($props.google || $props.facebook || $props.phone)
      ? (Vue.openBlock(), Vue.createBlock(_component_v_container, {
          key: 0,
          class: "text-center ma-0 pa-0"
        }, {
          default: Vue.withCtx(function () { return [
            _hoisted_1$1,
            Vue.createVNode(_component_v_container, null, {
              default: Vue.withCtx(function () { return [
                ($props.google)
                  ? (Vue.openBlock(), Vue.createBlock(_component_v_tooltip, {
                      key: 0,
                      top: ""
                    }, {
                      activator: Vue.withCtx(function (ref) {
                        var on = ref.on;
                        var attrs = ref.attrs;

                        return [
                        Vue.createVNode(_component_v_btn, Vue.mergeProps({
                          color: "#db3236",
                          class: "mr-2"
                        }, attrs, {
                          fab: "",
                          dark: "",
                          small: ""
                        }, Vue.toHandlers(on), {
                          onClick: _cache[1] || (_cache[1] = function ($event) { return ($options.loginWithGoogle()); })
                        }), {
                          default: Vue.withCtx(function () { return [
                            Vue.createVNode(_component_v_icon, null, {
                              default: Vue.withCtx(function () { return [
                                _hoisted_2$1
                              ]; }),
                              _: 1 /* STABLE */
                            })
                          ]; }),
                          _: 2 /* DYNAMIC */
                        }, 1040 /* FULL_PROPS, DYNAMIC_SLOTS */)
                      ];
                }),
                      default: Vue.withCtx(function () { return [
                        _hoisted_3$1
                      ]; }),
                      _: 1 /* STABLE */
                    }))
                  : Vue.createCommentVNode("v-if", true),
                ($props.facebook)
                  ? (Vue.openBlock(), Vue.createBlock(_component_v_tooltip, {
                      key: 1,
                      top: ""
                    }, {
                      activator: Vue.withCtx(function (ref) {
                        var on = ref.on;
                        var attrs = ref.attrs;

                        return [
                        Vue.createVNode(_component_v_btn, Vue.mergeProps({
                          color: "#3b5998",
                          class: "mr-2"
                        }, attrs, {
                          fab: "",
                          dark: "",
                          small: ""
                        }, Vue.toHandlers(on), {
                          onClick: _cache[2] || (_cache[2] = function ($event) { return (_ctx.loginWithFacebook()); })
                        }), {
                          default: Vue.withCtx(function () { return [
                            Vue.createVNode(_component_v_icon, null, {
                              default: Vue.withCtx(function () { return [
                                _hoisted_4$1
                              ]; }),
                              _: 1 /* STABLE */
                            })
                          ]; }),
                          _: 2 /* DYNAMIC */
                        }, 1040 /* FULL_PROPS, DYNAMIC_SLOTS */)
                      ];
                }),
                      default: Vue.withCtx(function () { return [
                        _hoisted_5$1
                      ]; }),
                      _: 1 /* STABLE */
                    }))
                  : Vue.createCommentVNode("v-if", true),
                ($props.phone)
                  ? (Vue.openBlock(), Vue.createBlock(_component_v_tooltip, {
                      key: 2,
                      top: ""
                    }, {
                      activator: Vue.withCtx(function (ref) {
                        var on = ref.on;
                        var attrs = ref.attrs;

                        return [
                        Vue.createVNode(_component_v_btn, Vue.mergeProps({ color: "primary" }, attrs, {
                          fab: "",
                          dark: "",
                          small: ""
                        }, Vue.toHandlers(on), {
                          onClick: _cache[3] || (_cache[3] = function ($event) { return ($options.loginWithPhone()); })
                        }), {
                          default: Vue.withCtx(function () { return [
                            Vue.createVNode(_component_v_icon, null, {
                              default: Vue.withCtx(function () { return [
                                _hoisted_6
                              ]; }),
                              _: 1 /* STABLE */
                            })
                          ]; }),
                          _: 2 /* DYNAMIC */
                        }, 1040 /* FULL_PROPS, DYNAMIC_SLOTS */)
                      ];
                }),
                      default: Vue.withCtx(function () { return [
                        _hoisted_7
                      ]; }),
                      _: 1 /* STABLE */
                    }))
                  : Vue.createCommentVNode("v-if", true)
              ]; }),
              _: 1 /* STABLE */
            }),
            Vue.createVNode(_component_v_dialog, {
              modelValue: _ctx.dialog,
              "onUpdate:modelValue": _cache[8] || (_cache[8] = function ($event) { return (_ctx.dialog = $event); }),
              width: "500"
            }, {
              default: Vue.withCtx(function () { return [
                _hoisted_8,
                Vue.createCommentVNode(" phone authentication provider: enter phone number "),
                (_ctx.step === 2)
                  ? (Vue.openBlock(), Vue.createBlock(_component_v_card, { key: 0 }, {
                      default: Vue.withCtx(function () { return [
                        Vue.createVNode(_component_v_card_title, { class: "body-1 primary white--text" }, {
                          default: Vue.withCtx(function () { return [
                            _hoisted_9
                          ]; }),
                          _: 1 /* STABLE */
                        }),
                        Vue.createVNode(_component_v_card_text, null, {
                          default: Vue.withCtx(function () { return [
                            Vue.createVNode(_component_v_container, { fluid: "" }, {
                              default: Vue.withCtx(function () { return [
                                Vue.createVNode(_component_v_row, {
                                  align: "center",
                                  justify: "center"
                                }, {
                                  default: Vue.withCtx(function () { return [
                                    Vue.createVNode(_component_v_col, null, {
                                      default: Vue.withCtx(function () { return [
                                        Vue.withDirectives(Vue.createVNode(_component_v_text_field, {
                                          modelValue: _ctx.phoneNumber,
                                          "onUpdate:modelValue": _cache[4] || (_cache[4] = function ($event) { return (_ctx.phoneNumber = $event); }),
                                          autocomplete: "off",
                                          label: "Phone Number",
                                          "prepend-icon": "mdi-cellphone"
                                        }, null, 8 /* PROPS */, ["modelValue"]), [
                                          [_directive_mask, _ctx.phoneMask]
                                        ])
                                      ]; }),
                                      _: 1 /* STABLE */
                                    }),
                                    Vue.createVNode(_component_v_col, null, {
                                      default: Vue.withCtx(function () { return [
                                        Vue.createVNode(_component_v_btn, {
                                          color: "primary",
                                          outlined: "",
                                          disabled: _ctx.progress,
                                          onClick: _cache[5] || (_cache[5] = function ($event) { return ($options.sendCode()); })
                                        }, {
                                          default: Vue.withCtx(function () { return [
                                            _hoisted_10
                                          ]; }),
                                          _: 1 /* STABLE */
                                        }, 8 /* PROPS */, ["disabled"])
                                      ]; }),
                                      _: 1 /* STABLE */
                                    })
                                  ]; }),
                                  _: 1 /* STABLE */
                                })
                              ]; }),
                              _: 1 /* STABLE */
                            })
                          ]; }),
                          _: 1 /* STABLE */
                        })
                      ]; }),
                      _: 1 /* STABLE */
                    }))
                  : Vue.createCommentVNode("v-if", true),
                Vue.createCommentVNode(" phone authentication provider: enter phone number "),
                (_ctx.step === 3)
                  ? (Vue.openBlock(), Vue.createBlock(_component_v_card, { key: 1 }, {
                      default: Vue.withCtx(function () { return [
                        Vue.createVNode(_component_v_card_title, { class: "body-1 primary white--text" }, {
                          default: Vue.withCtx(function () { return [
                            _hoisted_11
                          ]; }),
                          _: 1 /* STABLE */
                        }),
                        Vue.createVNode(_component_v_card_text, null, {
                          default: Vue.withCtx(function () { return [
                            Vue.createVNode(_component_v_container, { fluid: "" }, {
                              default: Vue.withCtx(function () { return [
                                Vue.createVNode(_component_v_row, {
                                  align: "center",
                                  justify: "center"
                                }, {
                                  default: Vue.withCtx(function () { return [
                                    Vue.createVNode(_component_v_col, null, {
                                      default: Vue.withCtx(function () { return [
                                        Vue.withDirectives(Vue.createVNode(_component_v_text_field, {
                                          modelValue: _ctx.confirmationCode,
                                          "onUpdate:modelValue": _cache[6] || (_cache[6] = function ($event) { return (_ctx.confirmationCode = $event); }),
                                          autocomplete: "off",
                                          label: "Confirmation Code"
                                        }, null, 8 /* PROPS */, ["modelValue"]), [
                                          [_directive_mask, _ctx.codeMask]
                                        ])
                                      ]; }),
                                      _: 1 /* STABLE */
                                    }),
                                    Vue.createVNode(_component_v_col, null, {
                                      default: Vue.withCtx(function () { return [
                                        Vue.createVNode(_component_v_btn, {
                                          color: "primary",
                                          outlined: "",
                                          disabled: _ctx.progress,
                                          onClick: _cache[7] || (_cache[7] = function ($event) { return ($options.confirmCode()); })
                                        }, {
                                          default: Vue.withCtx(function () { return [
                                            _hoisted_12
                                          ]; }),
                                          _: 1 /* STABLE */
                                        }, 8 /* PROPS */, ["disabled"])
                                      ]; }),
                                      _: 1 /* STABLE */
                                    })
                                  ]; }),
                                  _: 1 /* STABLE */
                                })
                              ]; }),
                              _: 1 /* STABLE */
                            })
                          ]; }),
                          _: 1 /* STABLE */
                        })
                      ]; }),
                      _: 1 /* STABLE */
                    }))
                  : Vue.createCommentVNode("v-if", true)
              ]; }),
              _: 1 /* STABLE */
            }, 8 /* PROPS */, ["modelValue"])
          ]; }),
          _: 1 /* STABLE */
        }))
      : Vue.createCommentVNode("v-if", true)
  }

  script$1.render = render$1;
  script$1.__file = "src/components/authentication/LoginWithProvider.vue";

  var script = {
    components: {
      Login: script$5,
      Register: script$4,
      PasswordReset: script$3,
      EmailVerification: script$2,
      LoginWithProvider: script$1,
    },

    data: function () { return ({
      dialog: false,
      persistent: true,

      firebase: null,
      registration: true,
      verification: true,
      google: false,
      facebook: false,
      phone: false,

      tab: 0,
      isLoading: false,
      loginError: null,
      resetPassword: false,
      registrationError: null,
      verificationError: null,
      emailVerificationRequired: false,
    }); },

    computed: {
      currentRoute: function currentRoute(after, before) {
        // if (typeof before === "undefined") return
        debug("[ this.$route.path (before, after) ]:", before, after);
        return this.$route.path
      },
    },

    watch: {
      currentRoute: function currentRoute() {
        debug("triggering [ checkRouterWhenReady ] because of current route change!");
        this.isCurrentRoutePublic();
      },

      dialog: function dialog(state) {
        debug("dialog(state)", state);
        this.$authGuardSettings.showAuthGuardDialog = state;
      },

      persistent: function persistent(state) {
        debug("persistent(state)", state);
        this.$authGuardSettings.persistent = state;
      },
    },

    created: function created() {
      var this$1 = this;

      // setup reactive watch for auth guard state
      var config = this.$authGuardSettings;
      setInterval(function () { return (this$1.dialog = config.showAuthGuardDialog ? true : false); }, 100);
      setInterval(function () { return (this$1.emailVerificationRequired = config.emailVerificationRequired ? true : false); }, 100);

      // read package config settings
      var settings = this.$authGuardSettings;

      this.firebase = settings.firebase || null;
      this.registration = typeof settings.registration !== "undefined" ? settings.registration : true;
      this.phone = typeof settings.phone !== "undefined" ? settings.phone : false;
      this.google = typeof settings.google !== "undefined" ? settings.google : true;
      this.facebook = typeof settings.facebook !== "undefined" ? settings.facebook : false;

      // check current route when router is ready
      this.$authGuardSettings.router.onReady(function () {
        debug("[ router ]: READY!");

        this$1.isCurrentRoutePublic();

        // monitor user auth state
        this$1.firebase.auth().onAuthStateChanged(function () {
          debug("triggering [ authCheck ] because of onAuthStateChanged!");

          // run authCheck only if on non public route
          if (!this$1.isCurrentRoutePublic()) { authCheck(); }
          // hide login dialog for public routes
          else {
            debug("DISABLING DIALOG");
            config.showAuthGuardDialog = false;
          }
        });
      });
    },

    methods: {
      // check if the current route is public to set negative persisten dialog
      isCurrentRoutePublic: function isCurrentRoutePublic() {
        var publicRoute =
          this.$route.matched[0] && typeof this.$route.matched[0].beforeEnter === "undefined" ? true : false;

        this.persistent = !publicRoute;

        if (!publicRoute) { debug("[ matched route ]:", this.$route.matched[0]); }
        else { this.$authGuardSettings; }

        debug("[ isCurrentRoutePublic ]:", publicRoute);

        return publicRoute
      },

      //
      showSignInTab: function showSignInTab() {
        this.resetPassword = false;
        this.tab = 0;
      },

      //
      loginWithEmail: async function loginWithEmail(ref) {
        var this$1 = this;
        var email = ref.email;
        var password = ref.password;

        this.isLoading = true;

        this.firebase.auth().signOut();

        this.firebase
          .auth()
          .signInWithEmailAndPassword(email, password)
          .then(function () {
            // this is needed to reload route that was not loaded if user was not authenticated
            if (this$1.$router.currentRoute.name === null) { this$1.$router.push(this$1.$router.currentRoute.path); }
          })
          .catch(function (error) { return (this$1.loginError = error); })
          .finally(function () { return (this$1.isLoading = false); });
      },

      //
      registerUser: async function registerUser(registration) {
        this.isLoading = true;

        try {
          await this.firebase.auth().createUserWithEmailAndPassword(registration.email, registration.password);
          await this.firebase.auth().signInWithEmailAndPassword(registration.email, registration.password);
          await this.firebase.auth().currentUser.updateProfile({ displayName: registration.name });
          await this.firebase.auth().currentUser.sendEmailVerification();

          this.isLoading = false;
        } catch (error) {
          this.isLoading = false;
          this.registrationError = error;
        }
      },

      //
      emailPasswordResetLink: function emailPasswordResetLink() {
        this.resetPassword = true;
        this.tab = 1;
        // const auth = firebase.auth();
        // const emailAddress = "user@example.com";

        // auth.sendPasswordResetEmail(emailAddress).then(function() {
        //   // Email sent.
        // }).catch(function(error) {
        //   // An error happened.
        // });
      },

      //
      signOut: function signOut() {
        this.firebase.auth().signOut();
      },

      //
      sendVerificationEmail: function sendVerificationEmail() {
        var this$1 = this;

        this.isLoading = true;

        this.firebase
          .auth()
          .currentUser.sendEmailVerification()
          .catch(function (error) { return (this$1.verificationError = error); })
          .finally(function () { return (this$1.isLoading = false); });
      },
    },
  };

  var _hoisted_1 = { key: 0 };
  var _hoisted_2 = { key: 1 };
  var _hoisted_3 = /*#__PURE__*/Vue.createTextVNode(" Sign In ");
  var _hoisted_4 = /*#__PURE__*/Vue.createTextVNode(" Register ");
  var _hoisted_5 = /*#__PURE__*/Vue.createTextVNode(" Reset Password ");

  function render(_ctx, _cache, $props, $setup, $data, $options) {
    var _component_v_progress_linear = Vue.resolveComponent("v-progress-linear");
    var _component_EmailVerification = Vue.resolveComponent("EmailVerification");
    var _component_v_tab = Vue.resolveComponent("v-tab");
    var _component_v_tabs = Vue.resolveComponent("v-tabs");
    var _component_Login = Vue.resolveComponent("Login");
    var _component_v_tab_item = Vue.resolveComponent("v-tab-item");
    var _component_Register = Vue.resolveComponent("Register");
    var _component_PasswordReset = Vue.resolveComponent("PasswordReset");
    var _component_v_tabs_items = Vue.resolveComponent("v-tabs-items");
    var _component_LoginWithProvider = Vue.resolveComponent("LoginWithProvider");
    var _component_v_card_actions = Vue.resolveComponent("v-card-actions");
    var _component_v_card = Vue.resolveComponent("v-card");
    var _component_v_container = Vue.resolveComponent("v-container");
    var _component_v_dialog = Vue.resolveComponent("v-dialog");

    return (Vue.openBlock(), Vue.createBlock("div", null, [
      Vue.createVNode(_component_v_dialog, {
        modelValue: _ctx.dialog,
        "onUpdate:modelValue": _cache[3] || (_cache[3] = function ($event) { return (_ctx.dialog = $event); }),
        persistent: _ctx.persistent,
        "overlay-opacity": "0.95",
        "content-class": "elevation-0"
      }, {
        default: Vue.withCtx(function () { return [
          Vue.createVNode(_component_v_container, {
            style: {"max-width":"500px"},
            class: "mb-5"
          }, {
            default: Vue.withCtx(function () { return [
              Vue.createVNode(_component_v_card, {
                flat: "",
                outlined: ""
              }, {
                default: Vue.withCtx(function () { return [
                  Vue.createVNode(_component_v_progress_linear, { indeterminate: _ctx.isLoading }, null, 8 /* PROPS */, ["indeterminate"]),
                  (_ctx.emailVerificationRequired)
                    ? (Vue.openBlock(), Vue.createBlock("div", _hoisted_1, [
                        Vue.createVNode(_component_EmailVerification, {
                          error: _ctx.verificationError,
                          "is-loading": _ctx.isLoading,
                          onSendEmail: $options.sendVerificationEmail,
                          onSignOut: $options.signOut
                        }, null, 8 /* PROPS */, ["error", "is-loading", "onSendEmail", "onSignOut"])
                      ]))
                    : (Vue.openBlock(), Vue.createBlock("div", _hoisted_2, [
                        Vue.createVNode(_component_v_tabs, {
                          modelValue: _ctx.tab,
                          "onUpdate:modelValue": _cache[1] || (_cache[1] = function ($event) { return (_ctx.tab = $event); }),
                          grow: ""
                        }, {
                          default: Vue.withCtx(function () { return [
                            Vue.createVNode(_component_v_tab, { onClick: $options.showSignInTab }, {
                              default: Vue.withCtx(function () { return [
                                _hoisted_3
                              ]; }),
                              _: 1 /* STABLE */
                            }, 8 /* PROPS */, ["onClick"]),
                            (!_ctx.resetPassword && _ctx.registration)
                              ? (Vue.openBlock(), Vue.createBlock(_component_v_tab, { key: 0 }, {
                                  default: Vue.withCtx(function () { return [
                                    _hoisted_4
                                  ]; }),
                                  _: 1 /* STABLE */
                                }))
                              : Vue.createCommentVNode("v-if", true),
                            (_ctx.resetPassword || !_ctx.registration)
                              ? (Vue.openBlock(), Vue.createBlock(_component_v_tab, { key: 1 }, {
                                  default: Vue.withCtx(function () { return [
                                    _hoisted_5
                                  ]; }),
                                  _: 1 /* STABLE */
                                }))
                              : Vue.createCommentVNode("v-if", true)
                          ]; }),
                          _: 1 /* STABLE */
                        }, 8 /* PROPS */, ["modelValue"]),
                        Vue.createVNode(_component_v_tabs_items, {
                          modelValue: _ctx.tab,
                          "onUpdate:modelValue": _cache[2] || (_cache[2] = function ($event) { return (_ctx.tab = $event); })
                        }, {
                          default: Vue.withCtx(function () { return [
                            Vue.createVNode(_component_v_tab_item, { class: "pt-5" }, {
                              default: Vue.withCtx(function () { return [
                                Vue.createVNode(_component_Login, {
                                  firebase: _ctx.firebase,
                                  error: _ctx.loginError,
                                  "is-loading": _ctx.isLoading,
                                  onCredentials: $options.loginWithEmail,
                                  onResetPassword: $options.emailPasswordResetLink
                                }, null, 8 /* PROPS */, ["firebase", "error", "is-loading", "onCredentials", "onResetPassword"])
                              ]; }),
                              _: 1 /* STABLE */
                            }),
                            (!_ctx.resetPassword && _ctx.registration)
                              ? (Vue.openBlock(), Vue.createBlock(_component_v_tab_item, {
                                  key: 0,
                                  class: "pt-5"
                                }, {
                                  default: Vue.withCtx(function () { return [
                                    Vue.createVNode(_component_Register, {
                                      error: _ctx.registrationError,
                                      "is-loading": _ctx.isLoading,
                                      onRegistration: $options.registerUser
                                    }, null, 8 /* PROPS */, ["error", "is-loading", "onRegistration"])
                                  ]; }),
                                  _: 1 /* STABLE */
                                }))
                              : Vue.createCommentVNode("v-if", true),
                            (_ctx.resetPassword || !_ctx.registration)
                              ? (Vue.openBlock(), Vue.createBlock(_component_v_tab_item, {
                                  key: 1,
                                  class: "pt-5"
                                }, {
                                  default: Vue.withCtx(function () { return [
                                    Vue.createVNode(_component_PasswordReset, {
                                      firebase: _ctx.firebase,
                                      error: _ctx.loginError,
                                      "is-loading": _ctx.isLoading,
                                      onShowSignInTab: $options.showSignInTab
                                    }, null, 8 /* PROPS */, ["firebase", "error", "is-loading", "onShowSignInTab"])
                                  ]; }),
                                  _: 1 /* STABLE */
                                }))
                              : Vue.createCommentVNode("v-if", true)
                          ]; }),
                          _: 1 /* STABLE */
                        }, 8 /* PROPS */, ["modelValue"])
                      ])),
                  (!_ctx.emailVerificationRequired)
                    ? (Vue.openBlock(), Vue.createBlock(_component_v_card_actions, { key: 2 }, {
                        default: Vue.withCtx(function () { return [
                          Vue.createVNode(_component_LoginWithProvider, {
                            google: _ctx.google,
                            facebook: _ctx.facebook,
                            phone: _ctx.phone
                          }, null, 8 /* PROPS */, ["google", "facebook", "phone"])
                        ]; }),
                        _: 1 /* STABLE */
                      }))
                    : Vue.createCommentVNode("v-if", true)
                ]; }),
                _: 1 /* STABLE */
              })
            ]; }),
            _: 1 /* STABLE */
          })
        ]; }),
        _: 1 /* STABLE */
      }, 8 /* PROPS */, ["modelValue", "persistent"])
    ]))
  }

  script.render = render;
  script.__file = "src/components/authentication/Guard.vue";

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

    debug("[ authGuard ]:", allowRoute);

    return allowRoute ? next() : null
  }

  /* eslint-env node */

  // Declare install function executed by Vue.use()
  var install = function (Vue, options) {
    if (install.installed) { return }

    install.installed = true;
    Vue.prototype.$authGuardSettings = options;
    Vue.component("AuthenticationGuard", script);
  };

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

  if (GlobalVue) { GlobalVue.use(plugin); }

  // To allow use as module (npm/webpack/etc.) export component
  var wrapper = {
    install: install,
  };

  var AuthMiddleware = AuthGuardMiddleware;

  exports.AuthMiddleware = AuthMiddleware;
  exports.default = wrapper;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
