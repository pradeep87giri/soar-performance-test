(function e(t, n, i) {
    function r(l, u) {
      if (!n[l]) {
        if (!t[l]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(l, !0);
          if (s) return s(l, !0);
          var o = new Error("Cannot find module '" + l + "'");
          throw o.code = "MODULE_NOT_FOUND", o
        }
        var f = n[l] = {
          exports: {}
        };
        t[l][0].call(f.exports, function(e) {
          var n = t[l][1][e];
          return r(n ? n : e)
        }, f, f.exports, e, t, n, i)
      }
      return n[l].exports
    }
    var s = typeof require == "function" && require;
    for (var l = 0; l < i.length; l++) r(i[l]);
    return r
  })({
    1: [function(e, t, n) {
      var i, r, s;
      s = e("./Utils");
      r = e("./Inline");
      i = function() {
        function e() {}
        e.indentation = 4;
        e.prototype.dump = function(e, t, n, i, l) {
          var u, a, o, f, c, h, p;
          if (t == null) {
            t = 0
          }
          if (n == null) {
            n = 0
          }
          if (i == null) {
            i = false
          }
          if (l == null) {
            l = null
          }
          f = "";
          c = n ? s.strRepeat(" ", n) : "";
          if (t <= 0 || typeof e !== "object" || e instanceof Date || s.isEmpty(e)) {
            f += c + r.dump(e, i, l)
          } else {
            if (e instanceof Array) {
              for (u = 0, o = e.length; u < o; u++) {
                h = e[u];
                p = t - 1 <= 0 || typeof h !== "object" || s.isEmpty(h);
                f += c + "-" + (p ? " " : "\n") + this.dump(h, t - 1, p ? 0 : n + this.indentation, i, l) + (p ? "\n" : "")
              }
            } else {
              for (a in e) {
                h = e[a];
                p = t - 1 <= 0 || typeof h !== "object" || s.isEmpty(h);
                f += c + r.dump(a, i, l) + ":" + (p ? " " : "\n") + this.dump(h, t - 1, p ? 0 : n + this.indentation, i, l) + (p ? "\n" : "")
              }
            }
          }
          return f
        };
        return e
      }();
      t.exports = i
    }, {
      "./Inline": 6,
      "./Utils": 10
    }],
    2: [function(e, t, n) {
      var i, r;
      r = e("./Pattern");
      i = function() {
        var e;
  
        function t() {}
        t.LIST_ESCAPEES = ["\\", "\\\\", '\\"', '"', "\0", "", "", "", "", "", "", "", "\b", "\t", "\n", "\v", "\f", "\r", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", (e = String.fromCharCode)(133), e(160), e(8232), e(8233)];
        t.LIST_ESCAPED = ["\\\\", '\\"', '\\"', '\\"', "\\0", "\\x01", "\\x02", "\\x03", "\\x04", "\\x05", "\\x06", "\\a", "\\b", "\\t", "\\n", "\\v", "\\f", "\\r", "\\x0e", "\\x0f", "\\x10", "\\x11", "\\x12", "\\x13", "\\x14", "\\x15", "\\x16", "\\x17", "\\x18", "\\x19", "\\x1a", "\\e", "\\x1c", "\\x1d", "\\x1e", "\\x1f", "\\N", "\\_", "\\L", "\\P"];
        t.MAPPING_ESCAPEES_TO_ESCAPED = function() {
          var e, n, i, r;
          i = {};
          for (e = n = 0, r = t.LIST_ESCAPEES.length; 0 <= r ? n < r : n > r; e = 0 <= r ? ++n : --n) {
            i[t.LIST_ESCAPEES[e]] = t.LIST_ESCAPED[e]
          }
          return i
        }();
        t.PATTERN_CHARACTERS_TO_ESCAPE = new r("[\\x00-\\x1f]|Â|Â |â¨|â©");
        t.PATTERN_MAPPING_ESCAPEES = new r(t.LIST_ESCAPEES.join("|").split("\\").join("\\\\"));
        t.PATTERN_SINGLE_QUOTING = new r("[\\s'\":{}[\\],&*#?]|^[-?|<>=!%@`]");
        t.requiresDoubleQuoting = function(e) {
          return this.PATTERN_CHARACTERS_TO_ESCAPE.test(e)
        };
        t.escapeWithDoubleQuotes = function(e) {
          var t;
          t = this.PATTERN_MAPPING_ESCAPEES.replace(e, function(e) {
            return function(t) {
              return e.MAPPING_ESCAPEES_TO_ESCAPED[t]
            }
          }(this));
          return '"' + t + '"'
        };
        t.requiresSingleQuoting = function(e) {
          return this.PATTERN_SINGLE_QUOTING.test(e)
        };
        t.escapeWithSingleQuotes = function(e) {
          return "'" + e.replace(/'/g, "''") + "'"
        };
        return t
      }();
      t.exports = i
    }, {
      "./Pattern": 8
    }],
    3: [function(e, t, n) {
      var i, r = function(e, t) {
          for (var n in t) {
            if (s.call(t, n)) e[n] = t[n]
          }
  
          function i() {
            this.constructor = e
          }
          i.prototype = t.prototype;
          e.prototype = new i;
          e.__super__ = t.prototype;
          return e
        },
        s = {}.hasOwnProperty;
      i = function(e) {
        r(t, e);
  
        function t(e, t, n) {
          this.message = e;
          this.parsedLine = t;
          this.snippet = n
        }
        t.prototype.toString = function() {
          if (this.parsedLine != null && this.snippet != null) {
            return "<DumpException> " + this.message + " (line " + this.parsedLine + ": '" + this.snippet + "')"
          } else {
            return "<DumpException> " + this.message
          }
        };
        return t
      }(Error);
      t.exports = i
    }, {}],
    4: [function(e, t, n) {
      var i, r = function(e, t) {
          for (var n in t) {
            if (s.call(t, n)) e[n] = t[n]
          }
  
          function i() {
            this.constructor = e
          }
          i.prototype = t.prototype;
          e.prototype = new i;
          e.__super__ = t.prototype;
          return e
        },
        s = {}.hasOwnProperty;
      i = function(e) {
        r(t, e);
  
        function t(e, t, n) {
          this.message = e;
          this.parsedLine = t;
          this.snippet = n
        }
        t.prototype.toString = function() {
          if (this.parsedLine != null && this.snippet != null) {
            return "<ParseException> " + this.message + " (line " + this.parsedLine + ": '" + this.snippet + "')"
          } else {
            return "<ParseException> " + this.message
          }
        };
        return t
      }(Error);
      t.exports = i
    }, {}],
    5: [function(e, t, n) {
      var i, r = function(e, t) {
          for (var n in t) {
            if (s.call(t, n)) e[n] = t[n]
          }
  
          function i() {
            this.constructor = e
          }
          i.prototype = t.prototype;
          e.prototype = new i;
          e.__super__ = t.prototype;
          return e
        },
        s = {}.hasOwnProperty;
      i = function(e) {
        r(t, e);
  
        function t(e, t, n) {
          this.message = e;
          this.parsedLine = t;
          this.snippet = n
        }
        t.prototype.toString = function() {
          if (this.parsedLine != null && this.snippet != null) {
            return "<ParseMore> " + this.message + " (line " + this.parsedLine + ": '" + this.snippet + "')"
          } else {
            return "<ParseMore> " + this.message
          }
        };
        return t
      }(Error);
      t.exports = i
    }, {}],
    6: [function(e, t, n) {
      var i, r, s, l, u, a, o, f, c = [].indexOf || function(e) {
        for (var t = 0, n = this.length; t < n; t++) {
          if (t in this && this[t] === e) return t
        }
        return -1
      };
      a = e("./Pattern");
      o = e("./Unescaper");
      r = e("./Escaper");
      f = e("./Utils");
      l = e("./Exception/ParseException");
      u = e("./Exception/ParseMore");
      i = e("./Exception/DumpException");
      s = function() {
        function e() {}
        e.REGEX_QUOTED_STRING = "(?:\"(?:[^\"\\\\]*(?:\\\\.[^\"\\\\]*)*)\"|'(?:[^']*(?:''[^']*)*)')";
        e.PATTERN_TRAILING_COMMENTS = new a("^\\s*#.*$");
        e.PATTERN_QUOTED_SCALAR = new a("^" + e.REGEX_QUOTED_STRING);
        e.PATTERN_THOUSAND_NUMERIC_SCALAR = new a("^(-|\\+)?[0-9,]+(\\.[0-9]+)?$");
        e.PATTERN_SCALAR_BY_DELIMITERS = {};
        e.settings = {};
        e.configure = function(e, t) {
          if (e == null) {
            e = null
          }
          if (t == null) {
            t = null
          }
          this.settings.exceptionOnInvalidType = e;
          this.settings.objectDecoder = t
        };
        e.parse = function(e, t, n) {
          var i, r;
          if (t == null) {
            t = false
          }
          if (n == null) {
            n = null
          }
          this.settings.exceptionOnInvalidType = t;
          this.settings.objectDecoder = n;
          if (e == null) {
            return ""
          }
          e = f.trim(e);
          if (0 === e.length) {
            return ""
          }
          i = {
            exceptionOnInvalidType: t,
            objectDecoder: n,
            i: 0
          };
          switch (e.charAt(0)) {
            case "[":
              r = this.parseSequence(e, i);
              ++i.i;
              break;
            case "{":
              r = this.parseMapping(e, i);
              ++i.i;
              break;
            default:
              r = this.parseScalar(e, null, ['"', "'"], i)
          }
          if (this.PATTERN_TRAILING_COMMENTS.replace(e.slice(i.i), "") !== "") {
            throw new l('Unexpected characters near "' + e.slice(i.i) + '".')
          }
          return r
        };
        e.dump = function(e, t, n) {
          var i, s, l;
          if (t == null) {
            t = false
          }
          if (n == null) {
            n = null
          }
          if (e == null) {
            return "null"
          }
          l = typeof e;
          if (l === "object") {
            if (e instanceof Date) {
              return e.toISOString()
            } else if (n != null) {
              s = n(e);
              if (typeof s === "string" || s != null) {
                return s
              }
            }
            return this.dumpObject(e)
          }
          if (l === "boolean") {
            return e ? "true" : "false"
          }
          if (f.isDigits(e)) {
            return l === "string" ? "'" + e + "'" : String(parseInt(e))
          }
          if (f.isNumeric(e)) {
            return l === "string" ? "'" + e + "'" : String(parseFloat(e))
          }
          if (l === "number") {
            return e === Infinity ? ".Inf" : e === -Infinity ? "-.Inf" : isNaN(e) ? ".NaN" : e
          }
          if (r.requiresDoubleQuoting(e)) {
            return r.escapeWithDoubleQuotes(e)
          }
          if (r.requiresSingleQuoting(e)) {
            return r.escapeWithSingleQuotes(e)
          }
          if ("" === e) {
            return '""'
          }
          if (f.PATTERN_DATE.test(e)) {
            return "'" + e + "'"
          }
          if ((i = e.toLowerCase()) === "null" || i === "~" || i === "true" || i === "false") {
            return "'" + e + "'"
          }
          return e
        };
        e.dumpObject = function(e, t, n) {
          var i, r, s, l, u;
          if (n == null) {
            n = null
          }
          if (e instanceof Array) {
            l = [];
            for (i = 0, s = e.length; i < s; i++) {
              u = e[i];
              l.push(this.dump(u))
            }
            return "[" + l.join(", ") + "]"
          } else {
            l = [];
            for (r in e) {
              u = e[r];
              l.push(this.dump(r) + ": " + this.dump(u))
            }
            return "{" + l.join(", ") + "}"
          }
        };
        e.parseScalar = function(e, t, n, i, r) {
          var s, u, o, h, p, E, T, _, A;
          if (t == null) {
            t = null
          }
          if (n == null) {
            n = ['"', "'"]
          }
          if (i == null) {
            i = null
          }
          if (r == null) {
            r = true
          }
          if (i == null) {
            i = {
              exceptionOnInvalidType: this.settings.exceptionOnInvalidType,
              objectDecoder: this.settings.objectDecoder,
              i: 0
            }
          }
          s = i.i;
          if (E = e.charAt(s), c.call(n, E) >= 0) {
            h = this.parseQuotedScalar(e, i);
            s = i.i;
            if (t != null) {
              A = f.ltrim(e.slice(s), " ");
              if (!(T = A.charAt(0), c.call(t, T) >= 0)) {
                throw new l("Unexpected characters (" + e.slice(s) + ").")
              }
            }
          } else {
            if (!t) {
              h = e.slice(s);
              s += h.length;
              _ = h.indexOf(" #");
              if (_ !== -1) {
                h = f.rtrim(h.slice(0, _))
              }
            } else {
              u = t.join("|");
              p = this.PATTERN_SCALAR_BY_DELIMITERS[u];
              if (p == null) {
                p = new a("^(.+?)(" + u + ")");
                this.PATTERN_SCALAR_BY_DELIMITERS[u] = p
              }
              if (o = p.exec(e.slice(s))) {
                h = o[1];
                s += h.length
              } else {
                throw new l("Malformed inline YAML string (" + e + ").")
              }
            }
            if (r) {
              h = this.evaluateScalar(h, i)
            }
          }
          i.i = s;
          return h
        };
        e.parseQuotedScalar = function(e, t) {
          var n, i, r;
          n = t.i;
          if (!(i = this.PATTERN_QUOTED_SCALAR.exec(e.slice(n)))) {
            throw new u("Malformed inline YAML string (" + e.slice(n) + ").")
          }
          r = i[0].substr(1, i[0].length - 2);
          if ('"' === e.charAt(n)) {
            r = o.unescapeDoubleQuotedString(r)
          } else {
            r = o.unescapeSingleQuotedString(r)
          }
          n += i[0].length;
          t.i = n;
          return r
        };
        e.parseSequence = function(e, t) {
          var n, i, r, s, l, a, o, f;
          a = [];
          l = e.length;
          r = t.i;
          r += 1;
          while (r < l) {
            t.i = r;
            switch (e.charAt(r)) {
              case "[":
                a.push(this.parseSequence(e, t));
                r = t.i;
                break;
              case "{":
                a.push(this.parseMapping(e, t));
                r = t.i;
                break;
              case "]":
                return a;
              case ",":
              case " ":
              case "\n":
                break;
              default:
                s = (o = e.charAt(r)) === '"' || o === "'";
                f = this.parseScalar(e, [",", "]"], ['"', "'"], t);
                r = t.i;
                if (!s && typeof f === "string" && (f.indexOf(": ") !== -1 || f.indexOf(":\n") !== -1)) {
                  try {
                    f = this.parseMapping("{" + f + "}")
                  } catch (i) {
                    n = i
                  }
                }
                a.push(f);
                --r
            }++r
          }
          throw new u("Malformed inline YAML string " + e)
        };
        e.parseMapping = function(e, t) {
          var n, i, r, s, l, a, o;
          l = {};
          s = e.length;
          i = t.i;
          i += 1;
          a = false;
          while (i < s) {
            t.i = i;
            switch (e.charAt(i)) {
              case " ":
              case ",":
              case "\n":
                ++i;
                t.i = i;
                a = true;
                break;
              case "}":
                return l
            }
            if (a) {
              a = false;
              continue
            }
            r = this.parseScalar(e, [":", " ", "\n"], ['"', "'"], t, false);
            i = t.i;
            n = false;
            while (i < s) {
              t.i = i;
              switch (e.charAt(i)) {
                case "[":
                  o = this.parseSequence(e, t);
                  i = t.i;
                  if (l[r] === void 0) {
                    l[r] = o
                  }
                  n = true;
                  break;
                case "{":
                  o = this.parseMapping(e, t);
                  i = t.i;
                  if (l[r] === void 0) {
                    l[r] = o
                  }
                  n = true;
                  break;
                case ":":
                case " ":
                case "\n":
                  break;
                default:
                  o = this.parseScalar(e, [",", "}"], ['"', "'"], t);
                  i = t.i;
                  if (l[r] === void 0) {
                    l[r] = o
                  }
                  n = true;
                  --i
              }++i;
              if (n) {
                break
              }
            }
          }
          throw new u("Malformed inline YAML string " + e)
        };
        e.evaluateScalar = function(e, t) {
          var n, i, r, s, u, a, o, c, h, p, E;
          e = f.trim(e);
          h = e.toLowerCase();
          switch (h) {
            case "null":
            case "":
            case "~":
              return null;
            case "true":
              return true;
            case "false":
              return false;
            case ".inf":
              return Infinity;
            case ".nan":
              return NaN;
            case "-.inf":
              return Infinity;
            default:
              s = h.charAt(0);
              switch (s) {
                case "!":
                  u = e.indexOf(" ");
                  if (u === -1) {
                    a = h
                  } else {
                    a = h.slice(0, u)
                  }
                  switch (a) {
                    case "!":
                      if (u !== -1) {
                        return parseInt(this.parseScalar(e.slice(2)))
                      }
                      return null;
                    case "!str":
                      return f.ltrim(e.slice(4));
                    case "!!str":
                      return f.ltrim(e.slice(5));
                    case "!!int":
                      return parseInt(this.parseScalar(e.slice(5)));
                    case "!!bool":
                      return f.parseBoolean(this.parseScalar(e.slice(6)), false);
                    case "!!float":
                      return parseFloat(this.parseScalar(e.slice(7)));
                    case "!!timestamp":
                      return f.stringToDate(f.ltrim(e.slice(11)));
                    default:
                      if (t == null) {
                        t = {
                          exceptionOnInvalidType: this.settings.exceptionOnInvalidType,
                          objectDecoder: this.settings.objectDecoder,
                          i: 0
                        }
                      }
                      o = t.objectDecoder, r = t.exceptionOnInvalidType;
                      if (o) {
                        E = f.rtrim(e);
                        u = E.indexOf(" ");
                        if (u === -1) {
                          return o(E, null)
                        } else {
                          p = f.ltrim(E.slice(u + 1));
                          if (!(p.length > 0)) {
                            p = null
                          }
                          return o(E.slice(0, u), p)
                        }
                      }
                      if (r) {
                        throw new l("Custom object support when parsing a YAML file has been disabled.")
                      }
                      return null
                  }
                  break;
                case "0":
                  if ("0x" === e.slice(0, 2)) {
                    return f.hexDec(e)
                  } else if (f.isDigits(e)) {
                    return f.octDec(e)
                  } else if (f.isNumeric(e)) {
                    return parseFloat(e)
                  } else {
                    return e
                  }
                  break;
                case "+":
                  if (f.isDigits(e)) {
                    c = e;
                    n = parseInt(c);
                    if (c === String(n)) {
                      return n
                    } else {
                      return c
                    }
                  } else if (f.isNumeric(e)) {
                    return parseFloat(e)
                  } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(e)) {
                    return parseFloat(e.replace(",", ""))
                  }
                  return e;
                case "-":
                  if (f.isDigits(e.slice(1))) {
                    if ("0" === e.charAt(1)) {
                      return -f.octDec(e.slice(1))
                    } else {
                      c = e.slice(1);
                      n = parseInt(c);
                      if (c === String(n)) {
                        return -n
                      } else {
                        return -c
                      }
                    }
                  } else if (f.isNumeric(e)) {
                    return parseFloat(e)
                  } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(e)) {
                    return parseFloat(e.replace(",", ""))
                  }
                  return e;
                default:
                  if (i = f.stringToDate(e)) {
                    return i
                  } else if (f.isNumeric(e)) {
                    return parseFloat(e)
                  } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(e)) {
                    return parseFloat(e.replace(",", ""))
                  }
                  return e
              }
          }
        };
        return e
      }();
      t.exports = s
    }, {
      "./Escaper": 2,
      "./Exception/DumpException": 3,
      "./Exception/ParseException": 4,
      "./Exception/ParseMore": 5,
      "./Pattern": 8,
      "./Unescaper": 9,
      "./Utils": 10
    }],
    7: [function(e, t, n) {
      var i, r, s, l, u, a;
      i = e("./Inline");
      u = e("./Pattern");
      a = e("./Utils");
      r = e("./Exception/ParseException");
      s = e("./Exception/ParseMore");
      l = function() {
        e.prototype.PATTERN_FOLDED_SCALAR_ALL = new u("^(?:(?<type>![^\\|>]*)\\s+)?(?<separator>\\||>)(?<modifiers>\\+|\\-|\\d+|\\+\\d+|\\-\\d+|\\d+\\+|\\d+\\-)?(?<comments> +#.*)?$");
        e.prototype.PATTERN_FOLDED_SCALAR_END = new u("(?<separator>\\||>)(?<modifiers>\\+|\\-|\\d+|\\+\\d+|\\-\\d+|\\d+\\+|\\d+\\-)?(?<comments> +#.*)?$");
        e.prototype.PATTERN_SEQUENCE_ITEM = new u("^\\-((?<leadspaces>\\s+)(?<value>.+?))?\\s*$");
        e.prototype.PATTERN_ANCHOR_VALUE = new u("^&(?<ref>[^ ]+) *(?<value>.*)");
        e.prototype.PATTERN_COMPACT_NOTATION = new u("^(?<key>" + i.REGEX_QUOTED_STRING + "|[^ '\"\\{\\[].*?) *\\:(\\s+(?<value>.+?))?\\s*$");
        e.prototype.PATTERN_MAPPING_ITEM = new u("^(?<key>" + i.REGEX_QUOTED_STRING + "|[^ '\"\\[\\{].*?) *\\:(\\s+(?<value>.+?))?\\s*$");
        e.prototype.PATTERN_DECIMAL = new u("\\d+");
        e.prototype.PATTERN_INDENT_SPACES = new u("^ +");
        e.prototype.PATTERN_TRAILING_LINES = new u("(\n*)$");
        e.prototype.PATTERN_YAML_HEADER = new u("^\\%YAML[: ][\\d\\.]+.*\n", "m");
        e.prototype.PATTERN_LEADING_COMMENTS = new u("^(\\#.*?\n)+", "m");
        e.prototype.PATTERN_DOCUMENT_MARKER_START = new u("^\\-\\-\\-.*?\n", "m");
        e.prototype.PATTERN_DOCUMENT_MARKER_END = new u("^\\.\\.\\.\\s*$", "m");
        e.prototype.PATTERN_FOLDED_SCALAR_BY_INDENTATION = {};
        e.prototype.CONTEXT_NONE = 0;
        e.prototype.CONTEXT_SEQUENCE = 1;
        e.prototype.CONTEXT_MAPPING = 2;
  
        function e(e) {
          this.offset = e != null ? e : 0;
          this.lines = [];
          this.currentLineNb = -1;
          this.currentLine = "";
          this.refs = {}
        }
        e.prototype.parse = function(t, n, s) {
          var l, u, o, f, c, h, p, E, T, _, A, L, d, N, g, R, x, C, I, m, S, w, v, y, P, b, D, O, M, G, U, X, F, k, H, j, Y, B, Q;
          if (n == null) {
            n = false
          }
          if (s == null) {
            s = null
          }
          this.currentLineNb = -1;
          this.currentLine = "";
          this.lines = this.cleanup(t).split("\n");
          h = null;
          c = this.CONTEXT_NONE;
          u = false;
          while (this.moveToNextLine()) {
            if (this.isCurrentLineEmpty()) {
              continue
            }
            if ("\t" === this.currentLine[0]) {
              throw new r("A YAML file cannot contain tabs as indentation.", this.getRealCurrentLineNb() + 1, this.currentLine)
            }
            N = D = false;
            if (Q = this.PATTERN_SEQUENCE_ITEM.exec(this.currentLine)) {
              if (this.CONTEXT_MAPPING === c) {
                throw new r("You cannot define a sequence item when in a mapping")
              }
              c = this.CONTEXT_SEQUENCE;
              if (h == null) {
                h = []
              }
              if (Q.value != null && (b = this.PATTERN_ANCHOR_VALUE.exec(Q.value))) {
                N = b.ref;
                Q.value = b.value
              }
              if (!(Q.value != null) || "" === a.trim(Q.value, " ") || a.ltrim(Q.value, " ").indexOf("#") === 0) {
                if (this.currentLineNb < this.lines.length - 1 && !this.isNextLineUnIndentedCollection()) {
                  f = this.getRealCurrentLineNb() + 1;
                  X = new e(f);
                  X.refs = this.refs;
                  h.push(X.parse(this.getNextEmbedBlock(null, true), n, s))
                } else {
                  h.push(null)
                }
              } else {
                if (((F = Q.leadspaces) != null ? F.length : void 0) && (b = this.PATTERN_COMPACT_NOTATION.exec(Q.value))) {
                  f = this.getRealCurrentLineNb();
                  X = new e(f);
                  X.refs = this.refs;
                  o = Q.value;
                  d = this.getCurrentLineIndentation();
                  if (this.isNextLineIndented(false)) {
                    o += "\n" + this.getNextEmbedBlock(d + Q.leadspaces.length + 1, true)
                  }
                  h.push(X.parse(o, n, s))
                } else {
                  h.push(this.parseValue(Q.value, n, s))
                }
              }
            } else if ((Q = this.PATTERN_MAPPING_ITEM.exec(this.currentLine)) && Q.key.indexOf(" #") === -1) {
              if (this.CONTEXT_SEQUENCE === c) {
                throw new r("You cannot define a mapping item when in a sequence")
              }
              c = this.CONTEXT_MAPPING;
              if (h == null) {
                h = {}
              }
              i.configure(n, s);
              try {
                x = i.parseScalar(Q.key)
              } catch (E) {
                p = E;
                p.parsedLine = this.getRealCurrentLineNb() + 1;
                p.snippet = this.currentLine;
                throw p
              }
              if ("<<" === x) {
                D = true;
                u = true;
                if (((k = Q.value) != null ? k.indexOf("*") : void 0) === 0) {
                  j = Q.value.slice(1);
                  if (this.refs[j] == null) {
                    throw new r('Reference "' + j + '" does not exist.', this.getRealCurrentLineNb() + 1, this.currentLine)
                  }
                  Y = this.refs[j];
                  if (typeof Y !== "object") {
                    throw new r("YAML merge keys used with a scalar value instead of an object.", this.getRealCurrentLineNb() + 1, this.currentLine)
                  }
                  if (Y instanceof Array) {
                    for (L = g = 0, m = Y.length; g < m; L = ++g) {
                      t = Y[L];
                      if (h[M = String(L)] == null) {
                        h[M] = t
                      }
                    }
                  } else {
                    for (x in Y) {
                      t = Y[x];
                      if (h[x] == null) {
                        h[x] = t
                      }
                    }
                  }
                } else {
                  if (Q.value != null && Q.value !== "") {
                    t = Q.value
                  } else {
                    t = this.getNextEmbedBlock()
                  }
                  f = this.getRealCurrentLineNb() + 1;
                  X = new e(f);
                  X.refs = this.refs;
                  G = X.parse(t, n);
                  if (typeof G !== "object") {
                    throw new r("YAML merge keys used with a scalar value instead of an object.", this.getRealCurrentLineNb() + 1, this.currentLine)
                  }
                  if (G instanceof Array) {
                    for (C = 0, S = G.length; C < S; C++) {
                      U = G[C];
                      if (typeof U !== "object") {
                        throw new r("Merge items must be objects.", this.getRealCurrentLineNb() + 1, U)
                      }
                      if (U instanceof Array) {
                        for (L = P = 0, w = U.length; P < w; L = ++P) {
                          t = U[L];
                          R = String(L);
                          if (!h.hasOwnProperty(R)) {
                            h[R] = t
                          }
                        }
                      } else {
                        for (x in U) {
                          t = U[x];
                          if (!h.hasOwnProperty(x)) {
                            h[x] = t
                          }
                        }
                      }
                    }
                  } else {
                    for (x in G) {
                      t = G[x];
                      if (!h.hasOwnProperty(x)) {
                        h[x] = t
                      }
                    }
                  }
                }
              } else if (Q.value != null && (b = this.PATTERN_ANCHOR_VALUE.exec(Q.value))) {
                N = b.ref;
                Q.value = b.value
              }
              if (D) {} else if (!(Q.value != null) || "" === a.trim(Q.value, " ") || a.ltrim(Q.value, " ").indexOf("#") === 0) {
                if (!this.isNextLineIndented() && !this.isNextLineUnIndentedCollection()) {
                  if (u || h[x] === void 0) {
                    h[x] = null
                  }
                } else {
                  f = this.getRealCurrentLineNb() + 1;
                  X = new e(f);
                  X.refs = this.refs;
                  B = X.parse(this.getNextEmbedBlock(), n, s);
                  if (u || h[x] === void 0) {
                    h[x] = B
                  }
                }
              } else {
                B = this.parseValue(Q.value, n, s);
                if (u || h[x] === void 0) {
                  h[x] = B
                }
              }
            } else {
              y = this.lines.length;
              if (1 === y || 2 === y && a.isEmpty(this.lines[1])) {
                try {
                  t = i.parse(this.lines[0], n, s)
                } catch (T) {
                  p = T;
                  p.parsedLine = this.getRealCurrentLineNb() + 1;
                  p.snippet = this.currentLine;
                  throw p
                }
                if (typeof t === "object") {
                  if (t instanceof Array) {
                    A = t[0]
                  } else {
                    for (x in t) {
                      A = t[x];
                      break
                    }
                  }
                  if (typeof A === "string" && A.indexOf("*") === 0) {
                    h = [];
                    for (O = 0, v = t.length; O < v; O++) {
                      l = t[O];
                      h.push(this.refs[l.slice(1)])
                    }
                    t = h
                  }
                }
                return t
              } else if ((H = a.ltrim(t).charAt(0)) === "[" || H === "{") {
                try {
                  return i.parse(t, n, s)
                } catch (_) {
                  p = _;
                  p.parsedLine = this.getRealCurrentLineNb() + 1;
                  p.snippet = this.currentLine;
                  throw p
                }
              }
              throw new r("Unable to parse.", this.getRealCurrentLineNb() + 1, this.currentLine)
            }
            if (N) {
              if (h instanceof Array) {
                this.refs[N] = h[h.length - 1]
              } else {
                I = null;
                for (x in h) {
                  I = x
                }
                this.refs[N] = h[I]
              }
            }
          }
          if (a.isEmpty(h)) {
            return null
          } else {
            return h
          }
        };
        e.prototype.getRealCurrentLineNb = function() {
          return this.currentLineNb + this.offset
        };
        e.prototype.getCurrentLineIndentation = function() {
          return this.currentLine.length - a.ltrim(this.currentLine, " ").length
        };
        e.prototype.getNextEmbedBlock = function(e, t) {
          var n, i, s, l, u, o, f;
          if (e == null) {
            e = null
          }
          if (t == null) {
            t = false
          }
          this.moveToNextLine();
          if (e == null) {
            l = this.getCurrentLineIndentation();
            f = this.isStringUnIndentedCollectionItem(this.currentLine);
            if (!this.isCurrentLineEmpty() && 0 === l && !f) {
              throw new r("Indentation problem.", this.getRealCurrentLineNb() + 1, this.currentLine)
            }
          } else {
            l = e
          }
          n = [this.currentLine.slice(l)];
          if (!t) {
            s = this.isStringUnIndentedCollectionItem(this.currentLine)
          }
          o = this.PATTERN_FOLDED_SCALAR_END;
          u = !o.test(this.currentLine);
          while (this.moveToNextLine()) {
            i = this.getCurrentLineIndentation();
            if (i === l) {
              u = !o.test(this.currentLine)
            }
            if (u && this.isCurrentLineComment()) {
              continue
            }
            if (this.isCurrentLineBlank()) {
              n.push(this.currentLine.slice(l));
              continue
            }
            if (s && !this.isStringUnIndentedCollectionItem(this.currentLine) && i === l) {
              this.moveToPreviousLine();
              break
            }
            if (i >= l) {
              n.push(this.currentLine.slice(l))
            } else if (a.ltrim(this.currentLine).charAt(0) === "#") {} else if (0 === i) {
              this.moveToPreviousLine();
              break
            } else {
              throw new r("Indentation problem.", this.getRealCurrentLineNb() + 1, this.currentLine)
            }
          }
          return n.join("\n")
        };
        e.prototype.moveToNextLine = function() {
          if (this.currentLineNb >= this.lines.length - 1) {
            return false
          }
          this.currentLine = this.lines[++this.currentLineNb];
          return true
        };
        e.prototype.moveToPreviousLine = function() {
          this.currentLine = this.lines[--this.currentLineNb]
        };
        e.prototype.parseValue = function(e, t, n) {
          var l, u, o, f, c, h, p, E, T;
          if (0 === e.indexOf("*")) {
            h = e.indexOf("#");
            if (h !== -1) {
              e = e.substr(1, h - 2)
            } else {
              e = e.slice(1)
            }
            if (this.refs[e] === void 0) {
              throw new r('Reference "' + e + '" does not exist.', this.currentLine)
            }
            return this.refs[e]
          }
          if (f = this.PATTERN_FOLDED_SCALAR_ALL.exec(e)) {
            c = (p = f.modifiers) != null ? p : "";
            o = Math.abs(parseInt(c));
            if (isNaN(o)) {
              o = 0
            }
            T = this.parseFoldedScalar(f.separator, this.PATTERN_DECIMAL.replace(c, ""), o);
            if (f.type != null) {
              i.configure(t, n);
              return i.parseScalar(f.type + " " + T)
            } else {
              return T
            }
          }
          if ((E = e.charAt(0)) === "[" || E === "{" || E === '"' || E === "'") {
            while (true) {
              try {
                return i.parse(e, t, n)
              } catch (u) {
                l = u;
                if (l instanceof s && this.moveToNextLine()) {
                  e += "\n" + a.trim(this.currentLine, " ")
                } else {
                  l.parsedLine = this.getRealCurrentLineNb() + 1;
                  l.snippet = this.currentLine;
                  throw l
                }
              }
            }
          } else {
            if (this.isNextLineIndented()) {
              e += "\n" + this.getNextEmbedBlock()
            }
            return i.parse(e, t, n)
          }
        };
        e.prototype.parseFoldedScalar = function(t, n, i) {
          var r, s, l, o, f, c, h, p, E, T;
          if (n == null) {
            n = ""
          }
          if (i == null) {
            i = 0
          }
          h = this.moveToNextLine();
          if (!h) {
            return ""
          }
          r = this.isCurrentLineBlank();
          T = "";
          while (h && r) {
            if (h = this.moveToNextLine()) {
              T += "\n";
              r = this.isCurrentLineBlank()
            }
          }
          if (0 === i) {
            if (f = this.PATTERN_INDENT_SPACES.exec(this.currentLine)) {
              i = f[0].length
            }
          }
          if (i > 0) {
            p = this.PATTERN_FOLDED_SCALAR_BY_INDENTATION[i];
            if (p == null) {
              p = new u("^ {" + i + "}(.*)$");
              e.prototype.PATTERN_FOLDED_SCALAR_BY_INDENTATION[i] = p
            }
            while (h && (r || (f = p.exec(this.currentLine)))) {
              if (r) {
                T += this.currentLine.slice(i)
              } else {
                T += f[1]
              }
              if (h = this.moveToNextLine()) {
                T += "\n";
                r = this.isCurrentLineBlank()
              }
            }
          } else if (h) {
            T += "\n"
          }
          if (h) {
            this.moveToPreviousLine()
          }
          if (">" === t) {
            c = "";
            E = T.split("\n");
            for (s = 0, l = E.length; s < l; s++) {
              o = E[s];
              if (o.length === 0 || o.charAt(0) === " ") {
                c = a.rtrim(c, " ") + o + "\n"
              } else {
                c += o + " "
              }
            }
            T = c
          }
          if ("+" !== n) {
            T = a.rtrim(T)
          }
          if ("" === n) {
            T = this.PATTERN_TRAILING_LINES.replace(T, "\n")
          } else if ("-" === n) {
            T = this.PATTERN_TRAILING_LINES.replace(T, "")
          }
          return T
        };
        e.prototype.isNextLineIndented = function(e) {
          var t, n, i;
          if (e == null) {
            e = true
          }
          n = this.getCurrentLineIndentation();
          t = !this.moveToNextLine();
          if (e) {
            while (!t && this.isCurrentLineEmpty()) {
              t = !this.moveToNextLine()
            }
          } else {
            while (!t && this.isCurrentLineBlank()) {
              t = !this.moveToNextLine()
            }
          }
          if (t) {
            return false
          }
          i = false;
          if (this.getCurrentLineIndentation() > n) {
            i = true
          }
          this.moveToPreviousLine();
          return i
        };
        e.prototype.isCurrentLineEmpty = function() {
          var e;
          e = a.trim(this.currentLine, " ");
          return e.length === 0 || e.charAt(0) === "#"
        };
        e.prototype.isCurrentLineBlank = function() {
          return "" === a.trim(this.currentLine, " ")
        };
        e.prototype.isCurrentLineComment = function() {
          var e;
          e = a.ltrim(this.currentLine, " ");
          return e.charAt(0) === "#"
        };
        e.prototype.cleanup = function(e) {
          var t, n, i, r, s, l, u, o, f, c, h, p, E, T;
          if (e.indexOf("\r") !== -1) {
            e = e.split("\r\n").join("\n").split("\r").join("\n")
          }
          t = 0;
          c = this.PATTERN_YAML_HEADER.replaceAll(e, ""), e = c[0], t = c[1];
          this.offset += t;
          h = this.PATTERN_LEADING_COMMENTS.replaceAll(e, "", 1), T = h[0], t = h[1];
          if (t === 1) {
            this.offset += a.subStrCount(e, "\n") - a.subStrCount(T, "\n");
            e = T
          }
          p = this.PATTERN_DOCUMENT_MARKER_START.replaceAll(e, "", 1), T = p[0], t = p[1];
          if (t === 1) {
            this.offset += a.subStrCount(e, "\n") - a.subStrCount(T, "\n");
            e = T;
            e = this.PATTERN_DOCUMENT_MARKER_END.replace(e, "")
          }
          f = e.split("\n");
          E = -1;
          for (r = 0, l = f.length; r < l; r++) {
            o = f[r];
            if (a.trim(o, " ").length === 0) {
              continue
            }
            i = o.length - a.ltrim(o).length;
            if (E === -1 || i < E) {
              E = i
            }
          }
          if (E > 0) {
            for (n = s = 0, u = f.length; s < u; n = ++s) {
              o = f[n];
              f[n] = o.slice(E)
            }
            e = f.join("\n")
          }
          return e
        };
        e.prototype.isNextLineUnIndentedCollection = function(e) {
          var t, n;
          if (e == null) {
            e = null
          }
          if (e == null) {
            e = this.getCurrentLineIndentation()
          }
          t = this.moveToNextLine();
          while (t && this.isCurrentLineEmpty()) {
            t = this.moveToNextLine()
          }
          if (false === t) {
            return false
          }
          n = false;
          if (this.getCurrentLineIndentation() === e && this.isStringUnIndentedCollectionItem(this.currentLine)) {
            n = true
          }
          this.moveToPreviousLine();
          return n
        };
        e.prototype.isStringUnIndentedCollectionItem = function() {
          return this.currentLine === "-" || this.currentLine.slice(0, 2) === "- "
        };
        return e
      }();
      t.exports = l
    }, {
      "./Exception/ParseException": 4,
      "./Exception/ParseMore": 5,
      "./Inline": 6,
      "./Pattern": 8,
      "./Utils": 10
    }],
    8: [function(e, t, n) {
      var i;
      i = function() {
        e.prototype.regex = null;
        e.prototype.rawRegex = null;
        e.prototype.cleanedRegex = null;
        e.prototype.mapping = null;
  
        function e(e, t) {
          var n, i, r, s, l, u, a, o, f;
          if (t == null) {
            t = ""
          }
          r = "";
          l = e.length;
          u = null;
          i = 0;
          s = 0;
          while (s < l) {
            n = e.charAt(s);
            if (n === "\\") {
              r += e.slice(s, +(s + 1) + 1 || 9e9);
              s++
            } else if (n === "(") {
              if (s < l - 2) {
                o = e.slice(s, +(s + 2) + 1 || 9e9);
                if (o === "(?:") {
                  s += 2;
                  r += o
                } else if (o === "(?<") {
                  i++;
                  s += 2;
                  a = "";
                  while (s + 1 < l) {
                    f = e.charAt(s + 1);
                    if (f === ">") {
                      r += "(";
                      s++;
                      if (a.length > 0) {
                        if (u == null) {
                          u = {}
                        }
                        u[a] = i
                      }
                      break
                    } else {
                      a += f
                    }
                    s++
                  }
                } else {
                  r += n;
                  i++
                }
              } else {
                r += n
              }
            } else {
              r += n
            }
            s++
          }
          this.rawRegex = e;
          this.cleanedRegex = r;
          this.regex = new RegExp(this.cleanedRegex, "g" + t.replace("g", ""));
          this.mapping = u
        }
        e.prototype.exec = function(e) {
          var t, n, i, r;
          this.regex.lastIndex = 0;
          n = this.regex.exec(e);
          if (n == null) {
            return null
          }
          if (this.mapping != null) {
            r = this.mapping;
            for (i in r) {
              t = r[i];
              n[i] = n[t]
            }
          }
          return n
        };
        e.prototype.test = function(e) {
          this.regex.lastIndex = 0;
          return this.regex.test(e)
        };
        e.prototype.replace = function(e, t) {
          this.regex.lastIndex = 0;
          return e.replace(this.regex, t)
        };
        e.prototype.replaceAll = function(e, t, n) {
          var i;
          if (n == null) {
            n = 0
          }
          this.regex.lastIndex = 0;
          i = 0;
          while (this.regex.test(e) && (n === 0 || i < n)) {
            this.regex.lastIndex = 0;
            e = e.replace(this.regex, t);
            i++
          }
          return [e, i]
        };
        return e
      }();
      t.exports = i
    }, {}],
    9: [function(e, t, n) {
      var i, r, s;
      s = e("./Utils");
      i = e("./Pattern");
      r = function() {
        function e() {}
        e.PATTERN_ESCAPED_CHARACTER = new i('\\\\([0abt\tnvfre "\\/\\\\N_LP]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8})');
        e.unescapeSingleQuotedString = function(e) {
          return e.replace(/\'\'/g, "'")
        };
        e.unescapeDoubleQuotedString = function(e) {
          if (this._unescapeCallback == null) {
            this._unescapeCallback = function(e) {
              return function(t) {
                return e.unescapeCharacter(t)
              }
            }(this)
          }
          return this.PATTERN_ESCAPED_CHARACTER.replace(e, this._unescapeCallback)
        };
        e.unescapeCharacter = function(e) {
          var t;
          t = String.fromCharCode;
          switch (e.charAt(1)) {
            case "0":
              return t(0);
            case "a":
              return t(7);
            case "b":
              return t(8);
            case "t":
              return "\t";
            case "\t":
              return "\t";
            case "n":
              return "\n";
            case "v":
              return t(11);
            case "f":
              return t(12);
            case "r":
              return t(13);
            case "e":
              return t(27);
            case " ":
              return " ";
            case '"':
              return '"';
            case "/":
              return "/";
            case "\\":
              return "\\";
            case "N":
              return t(133);
            case "_":
              return t(160);
            case "L":
              return t(8232);
            case "P":
              return t(8233);
            case "x":
              return s.utf8chr(s.hexDec(e.substr(2, 2)));
            case "u":
              return s.utf8chr(s.hexDec(e.substr(2, 4)));
            case "U":
              return s.utf8chr(s.hexDec(e.substr(2, 8)));
            default:
              return ""
          }
        };
        return e
      }();
      t.exports = r
    }, {
      "./Pattern": 8,
      "./Utils": 10
    }],
    10: [function(e, t, n) {
      var i, r, s = {}.hasOwnProperty;
      i = e("./Pattern");
      r = function() {
        function t() {}
        t.REGEX_LEFT_TRIM_BY_CHAR = {};
        t.REGEX_RIGHT_TRIM_BY_CHAR = {};
        t.REGEX_SPACES = /\s+/g;
        t.REGEX_DIGITS = /^\d+$/;
        t.REGEX_OCTAL = /[^0-7]/gi;
        t.REGEX_HEXADECIMAL = /[^a-f0-9]/gi;
        t.PATTERN_DATE = new i("^" + "(?<year>[0-9][0-9][0-9][0-9])" + "-(?<month>[0-9][0-9]?)" + "-(?<day>[0-9][0-9]?)" + "(?:(?:[Tt]|[ \t]+)" + "(?<hour>[0-9][0-9]?)" + ":(?<minute>[0-9][0-9])" + ":(?<second>[0-9][0-9])" + "(?:.(?<fraction>[0-9]*))?" + "(?:[ \t]*(?<tz>Z|(?<tz_sign>[-+])(?<tz_hour>[0-9][0-9]?)" + "(?::(?<tz_minute>[0-9][0-9]))?))?)?" + "$", "i");
        t.LOCAL_TIMEZONE_OFFSET = (new Date).getTimezoneOffset() * 60 * 1e3;
        t.trim = function(e, t) {
          var n, i;
          if (t == null) {
            t = "\\s"
          }
          n = this.REGEX_LEFT_TRIM_BY_CHAR[t];
          if (n == null) {
            this.REGEX_LEFT_TRIM_BY_CHAR[t] = n = new RegExp("^" + t + "" + t + "*")
          }
          n.lastIndex = 0;
          i = this.REGEX_RIGHT_TRIM_BY_CHAR[t];
          if (i == null) {
            this.REGEX_RIGHT_TRIM_BY_CHAR[t] = i = new RegExp(t + "" + t + "*$")
          }
          i.lastIndex = 0;
          return e.replace(n, "").replace(i, "")
        };
        t.ltrim = function(e, t) {
          var n;
          if (t == null) {
            t = "\\s"
          }
          n = this.REGEX_LEFT_TRIM_BY_CHAR[t];
          if (n == null) {
            this.REGEX_LEFT_TRIM_BY_CHAR[t] = n = new RegExp("^" + t + "" + t + "*")
          }
          n.lastIndex = 0;
          return e.replace(n, "")
        };
        t.rtrim = function(e, t) {
          var n;
          if (t == null) {
            t = "\\s"
          }
          n = this.REGEX_RIGHT_TRIM_BY_CHAR[t];
          if (n == null) {
            this.REGEX_RIGHT_TRIM_BY_CHAR[t] = n = new RegExp(t + "" + t + "*$")
          }
          n.lastIndex = 0;
          return e.replace(n, "")
        };
        t.isEmpty = function(e) {
          return !e || e === "" || e === "0" || e instanceof Array && e.length === 0 || this.isEmptyObject(e)
        };
        t.isEmptyObject = function(e) {
          var t;
          return e instanceof Object && function() {
            var n;
            n = [];
            for (t in e) {
              if (!s.call(e, t)) continue;
              n.push(t)
            }
            return n
          }().length === 0
        };
        t.subStrCount = function(e, t, n, i) {
          var r, s, l, u, a, o;
          r = 0;
          e = "" + e;
          t = "" + t;
          if (n != null) {
            e = e.slice(n)
          }
          if (i != null) {
            e = e.slice(0, i)
          }
          u = e.length;
          o = t.length;
          for (s = l = 0, a = u; 0 <= a ? l < a : l > a; s = 0 <= a ? ++l : --l) {
            if (t === e.slice(s, o)) {
              r++;
              s += o - 1
            }
          }
          return r
        };
        t.isDigits = function(e) {
          this.REGEX_DIGITS.lastIndex = 0;
          return this.REGEX_DIGITS.test(e)
        };
        t.octDec = function(e) {
          this.REGEX_OCTAL.lastIndex = 0;
          return parseInt((e + "").replace(this.REGEX_OCTAL, ""), 8)
        };
        t.hexDec = function(e) {
          this.REGEX_HEXADECIMAL.lastIndex = 0;
          e = this.trim(e);
          if ((e + "").slice(0, 2) === "0x") {
            e = (e + "").slice(2)
          }
          return parseInt((e + "").replace(this.REGEX_HEXADECIMAL, ""), 16)
        };
        t.utf8chr = function(e) {
          var t;
          t = String.fromCharCode;
          if (128 > (e %= 2097152)) {
            return t(e)
          }
          if (2048 > e) {
            return t(192 | e >> 6) + t(128 | e & 63)
          }
          if (65536 > e) {
            return t(224 | e >> 12) + t(128 | e >> 6 & 63) + t(128 | e & 63)
          }
          return t(240 | e >> 18) + t(128 | e >> 12 & 63) + t(128 | e >> 6 & 63) + t(128 | e & 63)
        };
        t.parseBoolean = function(e, t) {
          var n;
          if (t == null) {
            t = true
          }
          if (typeof e === "string") {
            n = e.toLowerCase();
            if (!t) {
              if (n === "no") {
                return false
              }
            }
            if (n === "0") {
              return false
            }
            if (n === "false") {
              return false
            }
            if (n === "") {
              return false
            }
            return true
          }
          return !!e
        };
        t.isNumeric = function(e) {
          this.REGEX_SPACES.lastIndex = 0;
          return typeof e === "number" || typeof e === "string" && !isNaN(e) && e.replace(this.REGEX_SPACES, "") !== ""
        };
        t.stringToDate = function(e) {
          var t, n, i, r, s, l, u, a, o, f, c, h;
          if (!(e != null ? e.length : void 0)) {
            return null
          }
          s = this.PATTERN_DATE.exec(e);
          if (!s) {
            return null
          }
          h = parseInt(s.year, 10);
          u = parseInt(s.month, 10) - 1;
          n = parseInt(s.day, 10);
          if (s.hour == null) {
            t = new Date(Date.UTC(h, u, n));
            return t
          }
          r = parseInt(s.hour, 10);
          l = parseInt(s.minute, 10);
          a = parseInt(s.second, 10);
          if (s.fraction != null) {
            i = s.fraction.slice(0, 3);
            while (i.length < 3) {
              i += "0"
            }
            i = parseInt(i, 10)
          } else {
            i = 0
          }
          if (s.tz != null) {
            o = parseInt(s.tz_hour, 10);
            if (s.tz_minute != null) {
              f = parseInt(s.tz_minute, 10)
            } else {
              f = 0
            }
            c = (o * 60 + f) * 6e4;
            if ("-" === s.tz_sign) {
              c *= -1
            }
          }
          t = new Date(Date.UTC(h, u, n, r, l, a, i));
          if (c) {
            t.setTime(t.getTime() - c)
          }
          return t
        };
        t.strRepeat = function(e, t) {
          var n, i;
          i = "";
          n = 0;
          while (n < t) {
            i += e;
            n++
          }
          return i
        };
        t.getStringFromFile = function(t, n) {
          var i, r, s, l, u, a, o, f;
          if (n == null) {
            n = null
          }
          f = null;
          if (typeof window !== "undefined" && window !== null) {
            if (window.XMLHttpRequest) {
              f = new XMLHttpRequest
            } else if (window.ActiveXObject) {
              a = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
              for (s = 0, l = a.length; s < l; s++) {
                u = a[s];
                try {
                  f = new ActiveXObject(u)
                } catch (e) {}
              }
            }
          }
          if (f != null) {
            if (n != null) {
              f.onreadystatechange = function() {
                if (f.readyState === 4) {
                  if (f.status === 200 || f.status === 0) {
                    return n(f.responseText)
                  } else {
                    return n(null)
                  }
                }
              };
              f.open("GET", t, true);
              return f.send(null)
            } else {
              f.open("GET", t, false);
              f.send(null);
              if (f.status === 200 || f.status === 0) {
                return f.responseText
              }
              return null
            }
          } else {
            o = e;
            r = o("fs");
            if (n != null) {
              return r.readFile(t, function(e, t) {
                if (e) {
                  return n(null)
                } else {
                  return n(String(t))
                }
              })
            } else {
              i = r.readFileSync(t);
              if (i != null) {
                return String(i)
              }
              return null
            }
          }
        };
        return t
      }();
      t.exports = r
    }, {
      "./Pattern": 8
    }],
    11: [function(e, t, n) {
      var i, r, s, l;
      r = e("./Parser");
      i = e("./Dumper");
      s = e("./Utils");
      l = function() {
        function e() {}
        e.parse = function(e, t, n) {
          if (t == null) {
            t = false
          }
          if (n == null) {
            n = null
          }
          return (new r).parse(e, t, n)
        };
        e.parseFile = function(e, t, n, i) {
          var r;
          if (t == null) {
            t = null
          }
          if (n == null) {
            n = false
          }
          if (i == null) {
            i = null
          }
          if (t != null) {
            return s.getStringFromFile(e, function(e) {
              return function(r) {
                var s;
                s = null;
                if (r != null) {
                  s = e.parse(r, n, i)
                }
                t(s)
              }
            }(this))
          } else {
            r = s.getStringFromFile(e);
            if (r != null) {
              return this.parse(r, n, i)
            }
            return null
          }
        };
        e.dump = function(e, t, n, r, s) {
          var l;
          if (t == null) {
            t = 2
          }
          if (n == null) {
            n = 4
          }
          if (r == null) {
            r = false
          }
          if (s == null) {
            s = null
          }
          l = new i;
          l.indentation = n;
          return l.dump(e, t, 0, r, s)
        };
        e.stringify = function(e, t, n, i, r) {
          return this.dump(e, t, n, i, r)
        };
        e.load = function(e, t, n, i) {
          return this.parseFile(e, t, n, i)
        };
        return e
      }();
      if (typeof window !== "undefined" && window !== null) {
        window.YAML = l
      }
      if (typeof window === "undefined" || window === null) {
        this.YAML = l
      }
      t.exports = l
    }, {
      "./Dumper": 1,
      "./Parser": 7,
      "./Utils": 10
    }]
  }, {}, [11]);
  