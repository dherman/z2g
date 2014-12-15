# z2g

A script for converting exported Zimbra mail filter files (in sieve format) to a format that can be imported into Gmail filters.

Usage:

```
% npm install -g z2g
% z2g 'My Name' 'my@address.com' filters.sieve > mailFilters.xml
```

# Caveats

**WARNING: The conversion is lossy.**

There are a bunch of aspects of Zimbra mail filters that don't translate fully to Gmail filters:

* Gmail seems to disregard special characters in search strings, so you might find some rules *overmatch* if you were counting on them only matching special characters. I've run into this with subject prefixes like "[Foo]" and the brackets get ignored, so emails that simply mention "Foo" in the subject get matched.

* Gmail doesn't have functionality for short-circuiting any remaining rules when a given rule matches. Gmail does match rules in order, but it applies all matching rules no matter what. There are ostensibly tricks for preventing subsequent rules for matching--something to do with applying labels that force subsequent rules not to match--but I haven't tried them.

There are also bound to be lots of bugs. Please ping me on IRC and I'll try to fix them! My nick is `dherman`.
