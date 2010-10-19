# The Javascript Commons

This is a simple library for bootstrapping compatibility into the many nearly
compatible implementations that exist. It provides shims to make it possible to
interoperate with code not designed for compatibility and some modules to make
getting started as quick and painless as possible. We should all be able to
take advantage of the great work poured into the various javascript runtimes and
well thought out inside them.

Javascript Commons is similar in nature to Apache Commons, but much smaller. You
could also think of the `commons` module as like CommonJS without the J -- after
all, the J stands for Java, and that's not our style.

## Supported Platforms

- node.js
- narwhal
- GPSEE
- ringo.js
- Flusspferd

### We need some help for supporting these platforms:

- Browsers, modern and legacy
- v8cgi
- ejscript
- MonkeyScript

Abd any others we are missing...

## Usage

To shim your environment for full compatibility:

    require("commons");

This will first upgrade your runtime with as much es5 as possible that can be
shimmed into es3 (in most cases nothing will need to be added as the javascript
engine vendors have picked off most of this low-hanging fruit). Then it will
load all available module shims.

Or you can be selective with what you want loaded:
    
    require("commons/binary").shim();
    require("commons/fs").shim();

The key here is we're simply enhancing the native binary code with a few well-
defined helpers. We're not forcing you to use *our* binary module, which means
can use modules that are completely oblivious to our newly defined API without
issue. We don't all have to agree *what* the right binary module is or *where*
to load it from. This is a critical win.

Of course if you prefer to use the binary classes exposed by the library you can
do that too. Binary objects you create will remain compatible with your host
runtime's binaries, so you can intermix libraries that are completely unaware of
CommonJS binaries. The binaries exported inherit from the prototype of the host
binary object (Buffer in Binary/F and node, and Binary in the Binary/B spec).

    var binary = require("commons/binary");
    var assert = require("commons/assert");
    
    var buf = binary.Buffer([97, 98, 99]);
    assert.equal(buf.toString("ascii"), "abc");
    assert.ok(typeof buf.set === "function");
    assert.ok(buf instanceof binary.NativeBinary);
    assert.ok(binary.isBinary(buf));
    
    var bs = binary.ByteString("abc");
    assert.equal(bs.toString("ascii"), "abc");
    assert.ok(typeof bs.set === "undefined");
    assert.ok(bs instanceof binary.NativeBinary);
    assert.ok(binary.isBinary(bs));
    
    var runtime = require("commons/process").runtime;
    if (runtime == "node") {
        assert.ok(buf instanceof Buffer);
        assert.ok(bs instanceof Buffer);
    }
    else if (runtime == "narwhal") {
        assert.ok(buf instanceof require("binary").Binary);
        assert.ok(bs instanceof require("binary").Binary);
    }

**NOTE:** this probably won't completely work yet

## Running the Tests

From the commons package root:

    <runtime> lib/commons.js

Or for just the binary tests:

    <runtime> lib/commons/binary.js

## The Process Module

We sniff the runtime and javascript engine and expose it in the process module:

    require("commons/process").runtime;

To find out what javascript engine your on:

    require("commons/process").engine;

Bear in mind: forking based on the underlying runtime or engine should be
avoided at all costs -- it's functionally equivalent to user-agent sniffing and
is probably just as bad.

**TODO** right now if you require("commons") we adding process as a global for
node compatibility -- we should probably have more switches for shimming, maybe
`require("commons/runtime/node").shim()` or some such would be best.

## Philosophy

We have been suffering with the false-chioce of lowest common denominator APIs
and more useful but runtime-specific classes for too long. We can have both and
still enjoy some level of interoperability.

**TODO:** describe binary, stream, and fs libs and how fs (and other io libs) can
be used interchangably in both a callback/evented-stream context or a
synchronous/promised/forEach-stream context

## Rationale

To date most efforts have been focused on creating specs for the various runtime
implementations to follow. This has been met with some success in that there are
quite a few runtimes which implement one version or another of some key specs.
None the less it is still almost impossible to write code that works across even
a few runtimes. This library seeks to change that.

Rather than focusing on the underlying classes that implement specifications,
the goal of this library is to take what is implemented by the various runtimes
and enhance where needed to implement base interfaces. The `binary` interfaces
are a good example.

There are two CommonJS binary specifications that have seen the most
implementation: Binary/B and Binary/F. Binary/B defines ByteString and ByteArray
and is implemented in most CommonJS runtimes. Binary/F talks in terms of Buffer,
and is the binary representation node uses. While these two APIs seemingly
differ dramatically they share enough in common for us to be able to do useful
things with binary data regardless of the underlying form.

One key lesson that users of dynamic languages have learned over and over, yet
bears repeating: `instanceof` is insufficient. Feature testing is the *only* way
forward for interoperability. In this light, we can define a very light API that
can be shimmed onto any of the existing native binary classes to at least let us
read binary data in a "common" way:

    String.prototype.getBytes: decodes string, returns Binary object
    Binary.prototype.get: returns Number byte
    Binary.prototype.toString: encodes string, returns String

It's important to note that Binary need not be an actual class, just an idea.
The underlying class can be anything that is suitable in the hosting runtime.

Here's the layout of the various Binary feature APIs:

    Binary (no mutable APIs defined, just `prototype.get` and friends)
        
        MutableBinary (defines `prototype.set`)
            
            MutableLengthBinary (defines `prototype.length [[Put]]`)
                
                ByteArray (adds Array.prototype conventions, from Binary/B)
                
            SubsettableBinary (adds `prototype.subset`)
                
                Buffer (SubsettableBinary plus node and Binary/F extras)
        
        ByteString (adds String.prototype conventions, from Binary/B)


Elaborating on the hierarchy a bit, the next level of specificity is mutability:
being able to change the bytes:

    MutableBinary.prototype.set: sets byte at index, returns Number byte

There are certainly uses for more optimized interaction paradigms, like copying
bytes from some Binary to a MutableBinary. We can specify these with additional
higher-level interfaces but fundamentally all MutableBinary needs is Binary and
a `set` method.

MutableBinary says nothing about the length semantics of a Binary object --
nowhere in the interface is there a means to even alter the length. But some
binary paradigms, like byte arrays, allow for mutable lengths. Thus another type
of interface is born: MutableLengthBinary.

    MutableLengthBinary.prototype.length[[Put]]: sets length to provided Number

Finally, there is another type of interface that extends MutableBinary (but not
MutableLengthBinary) -- the ability to get a range -- or subset -- of a binary
object. SubsettableBinary requires just one method:

    SubsettableBinary.prototype.subset: returns the subsetted SubsettableBinary

It's a relatively simple hierarchy. This hasn't been proposed as a standard but
if met with optimism from the CommonJS and node.js communities it will be.

There are no doubt more interesting or useful interfaces we may want to build on
top of these base specs. For instance we should probably specify methods which
can be optimized by the runtime (such as `slice`). But what's outlined above
out to be enought to model the interaction of pretty much every binary class in
all of javascriptland.

So while this prototypal hierarchy will be made available in this library, it is
really nothing more than javascript engineering porn. As mentioned above: we
**should not** need instanceof and friends to do useful things with binary data.
We should be able to work with binary data on all runtimes -- we should be able
to do this *today*.

## License

The vast majority of this code was lifted from the Persevere's promised-io
package. As such it is licensed under the AFL or BSD license.

It is as yet undetermined whether this will be a Persevere project or even a
separate Dojo foundation project, but as this is possible all contributions will
require a Dojo CLA.
