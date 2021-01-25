.PHONY: all bootstrap ship shipMAS clean build exportArchive exportArchiveMAS package inspect

all: bootstrap ship

bootstrap:
	yarn install

ship: clean build exportArchive package
shipMAS: clean build exportArchiveMAS

clean:
	rm -rf Artifacts
	xcodebuild clean

build:
	yarn build
	xcodebuild build archive -scheme Polyglot -archivePath ./Artifacts/Polyglot.xcarchive

exportArchive:
	xcodebuild -exportArchive -exportOptionsPlist ./exportOptions.plist -archivePath ./Artifacts/Polyglot.xcarchive -exportPath ./Artifacts/Exported

exportArchiveMAS:
	xcodebuild -exportArchive -exportOptionsPlist ./exportOptionsMAS.plist -archivePath ./Artifacts/Polyglot.xcarchive

package:
	yarn dmg

inspect:
	pluginkit -mAvvv -p com.apple.Safari.extension