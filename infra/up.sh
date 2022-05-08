if test -f ".env"; then
  source .env
fi

if test -f ".env.local"; then
  source .env.local
fi

echo "Checking for network $DOCKER_NETWORK_NAME..."
network=(docker network ls -f name=$DOCKER_NETWORK_NAME --format {{.ID}})
if [ -z "$network" ]
then
  echo "Creating network $DOCKER_NETWORK_NAME..."
  docker network create $DOCKER_NETWORK_NAME
else
  echo "Network $DOCKER_NETWORK_NAME already exists"
fi
echo "Building server image..."
docker build -f api.Dockerfile -t $DOCKER_SERVER_NAME .

dbContainer=$(docker container ls --all --filter name=$DOCKER_DB_NAME --format {{.ID}})
if [ -z "$dbContainer" ]
then
  echo "Creating and starting DB container..."
  docker run --name=$DOCKER_DB_NAME -v="${DB_PATH}:/var/lib/postgresql/data" --network=$DOCKER_NETWORK_NAME -e POSTGRES_PASSWORD=$DB_PASSWORD -e POSTGRES_USER=$DB_USER --detach postgres:14-alpine
else
  echo "Starting existing DB container..."
  docker container start $dbContainer
fi

serverContainer=$(docker container ls --all --filter name=$DOCKER_SERVER_NAME --format {{.ID}})
echo $serverContainer
if [ ! -z "$serverContainer" ]
then
  echo "Stopping and removing existing server container"
  docker container stop $serverContainer
  docker container rm $serverContainer
fi

echo "Starting server container..."
docker run --name=$DOCKER_SERVER_NAME --network=$DOCKER_NETWORK_NAME --publish=3010:3010 --detach $DOCKER_SERVER_NAME

echo "Pruning dangling images"
docker image prune -f