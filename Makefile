docker-release: 
	docker buildx rm mybuilder || true
	docker buildx create --name mybuilder --use
	env $$(cat .env | grep -v "#" | xargs) docker buildx bake --set "*.platform=linux/arm64,linux/amd64" -f docker-compose.build.yaml --push
	docker buildx rm mybuilder

quick-deploy:
	docker-compose down
	docker-compose pull
	docker-compose up

clean:
	docker-compose down
	docker volume rm zeuscloud_neo4j_conf || true
	docker volume rm zeuscloud_neo4j_data || true
	docker volume rm zeuscloud_neo4j_import || true
	docker volume rm zeuscloud_neo4j_logs || true
	docker volume rm zeuscloud_neo4j_plugins || true
	docker volume rm zeuscloud_postgres || true
