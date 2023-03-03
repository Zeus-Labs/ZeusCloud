docker-release: 
	docker buildx rm mybuilder || true
	docker buildx create --name mybuilder --use
	env $$(cat .env | grep -v "#" | xargs) docker buildx bake --set "*.platform=linux/arm64,linux/amd64" -f docker-compose.build.yaml --push
	docker buildx rm mybuilder

quick-deploy:
	docker-compose down
	docker-compose pull
	ENCRYPTION_KEY=$$(openssl rand -base64 32) docker-compose up