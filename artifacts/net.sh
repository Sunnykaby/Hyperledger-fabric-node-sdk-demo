

# default image tag
IMAGETAG="1.2.0"
export COMPOSE_PROJECT_NAME=artifacts
export IMAGE_TAG=$IMAGETAG
COMPOSE_FILE=docker-compose-e2e.yaml

# Print the usage message
function printHelp() {
	echo "Usage: "
	echo "  net.sh up|down"
	echo "  net.sh -h|--help (print this message)"
	echo "    <mode> - one of 'up', 'down'"
	echo "      - 'up' - up the network for fabric"
	echo "      - 'down' - down the network for fabric"
	echo
}

function networkUp() {
  IMAGE_TAG=$IMAGETAG docker-compose -f $COMPOSE_FILE up -d 2>&1
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to start network"
    exit 1
  fi
}
function clearContainers() {
  CONTAINER_IDS=$(docker ps -a | awk '($2 ~ /dev-peer.*.mycc.*/) {print $1}')
  if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" == " " ]; then
    echo "---- No containers available for deletion ----"
  else
    docker rm -f $CONTAINER_IDS
  fi
}


function networkDown() {
  docker-compose -f $COMPOSE_FILE down --volumes --remove-orphans
  clearContainers
}

MODE=$1
# cd artifacts
# Determine whether starting, stopping, restarting or generating for announce
if [ "$MODE" == "up" ]; then
	networkUp
	echo "All Done"
elif [ "$MODE" == "down" ]; then
	networkDown
	echo "All Done"
else
	printHelp
	exit 1
fi

