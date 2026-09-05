# Packaging for objkt interactive tokens. Not a build step: nothing here compiles,
# minifies or transforms the work, and src/ still opens from file:// as it always
# did. All this does is rearrange the same files into the layout objkt requires —
# index.html at the top of a ZIP, everything relative, nothing fetched from outside.

SRC    := src
BUILD  := build
ENGINE := $(SRC)/context-collapse.js

# A work is any page but the contact sheet, which is a front door and not a piece.
PAGES := $(filter-out $(SRC)/index.html,$(wildcard $(SRC)/*.html))
WORKS := $(patsubst $(SRC)/%.html,%,$(PAGES))
ZIPS  := $(patsubst %,$(BUILD)/%.zip,$(WORKS))

all: $(ZIPS)

# One work: the page becomes index.html, its config and the engine go into js/,
# and the script paths are moved to match. They stay relative — objkt blocks
# anything absolute or external, so ./js/foo.js and never /js/foo.js.
# No COPYING in the ZIP: every script carries its own notice and its LibreJS
# licence tag, which is what anyone opening the package will actually read.
$(BUILD)/%.zip: $(SRC)/%.html $(SRC)/%.js $(ENGINE)
	@rm -rf $(BUILD)/$* $@
	@mkdir -p $(BUILD)/$*/js
	cp $(ENGINE) $(SRC)/$*.js $(BUILD)/$*/js/
	sed -E 's|(<script src=")\./([^"/]+\.js")|\1./js/\2|g' $< > $(BUILD)/$*/index.html
	cd $(BUILD)/$* && zip -q -r -X ../$*.zip . -x '*.DS_Store'
	@echo "  packaged $*"

# What objkt actually requires, checked rather than assumed.
check: all
	@fail=0; \
	for w in $(WORKS); do \
	  if grep -qE '(src|href)="(https?:)?//|(src|href)="/' $(BUILD)/$$w/index.html; then \
	    echo "$$w: absolute or external reference in index.html"; fail=1; fi; \
	  if grep -qE '<script src="\./[^"/]+\.js"' $(BUILD)/$$w/index.html; then \
	    echo "$$w: a script path was not moved into js/"; fail=1; fi; \
	  unzip -l $(BUILD)/$$w.zip | grep -qE ' index\.html$$' || \
	    { echo "$$w: index.html is not at the top level of the ZIP"; fail=1; }; \
	  for f in $$(sed -nE 's|.*<script src="\./([^"]+)".*|\1|p' $(BUILD)/$$w/index.html); do \
	    [ -f $(BUILD)/$$w/$$f ] || { echo "$$w: index.html points at a missing $$f"; fail=1; }; \
	  done; \
	done; \
	if [ $$fail != 0 ]; then echo "FAILED"; exit 1; fi; \
	echo "$(words $(WORKS)) works packaged and checked"

clean:
	rm -rf $(BUILD)

.PHONY: all check clean
