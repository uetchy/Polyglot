.PHONY: bootstrap clean ship

default: bootstrap ship

bootstrap:
	carthage update --platform macos
	yarn install

clean:
	yarn clean

ship:
	yarn ship
