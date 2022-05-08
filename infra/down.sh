if test -f ".env"; then
  source .env
fi

if test -f ".env.local"; then
  source .env.local
fi

dbContainer=$(docker container ls --filter name=$DOCKER_DB_NAME --format {{.ID}})
if [ ! -z "$dbContainer" ]
then
  docker stop $dbContainer
  echo "DB container stopped"
fi

serverContainer=$(docker container ls --filter name=$DOCKER_SERVER_NAME --format {{.ID}})
if [ ! -z "$serverContainer" ]
then
  docker stop $serverContainer
  echo "Server container stopped"
fi