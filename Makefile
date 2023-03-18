docker-release: 
	docker buildx rm mybuilder || true
	docker buildx create --name mybuilder --use
	env $$(cat .env | grep -v "#" | xargs) docker buildx bake --set "*.platform=linux/arm64,linux/amd64" -f docker-compose.build.yaml --push
	docker buildx rm mybuilder

quick-deploy:
	docker-compose down
	docker-compose pull
	ENCRYPTION_KEY=$$(openssl rand -base64 32) docker-compose up

clean:
	docker volume rm zeuscloud_neo4j_conf
	docker volume rm zeuscloud_neo4j_data
	docker volume rm zeuscloud_neo4j_import
	docker volume rm zeuscloud_neo4j_logs
	docker volume rm zeuscloud_neo4j_plugins
	docker volume rm zeuscloud_postgres