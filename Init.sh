#!/bin/bash

WORK_DIR=${PWD}
FAB_VER=v1.2.0

# Print the usage message
function printHelp() {
	echo "Usage: "
	echo "  Init.sh local|remote|clean"
	echo "  Init.sh -h|--help (print this message)"
	echo "    <mode> - one of 'local', 'remote', 'clean'"
	echo "      - 'local' - Start the native fabric network from the local config file and crypto files"
	echo "      - 'link' - Start the native fabric network from the remote config file and crypto files"
	echo "      - 'clean' - rm the unuseless dir and files"
	echo
}

function do_local() {
	mkdir demo
	cp -r artifacts-local demo/artifacts
	cp -r node demo/node
	cp -r src demo/artifacts/src
}

function do_remote() {
	mkdir demo
	cp -r artifacts-remote demo/artifacts
	mv demo/artifacts/net.sh demo/net.sh
	cp -r node demo/node
	cp -r src demo/artifacts/src
}

function do_clean() {
	rm -rf demo 
}

MODE=$1

if [ "$MODE" == "local" ]; then
	do_local
elif [ "$MODE" == "remote" ]; then
	do_remote
elif [ "$MODE" == "clean" ]; then
	do_clean
else
	printHelp
	exit 1
fi
