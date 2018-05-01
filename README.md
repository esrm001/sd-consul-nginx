# sd-consul-nginx

This application is based on 3 containers:

- A consul container running as normal
- An express application which registers its service with consul using `/agent/service/register` as documented 
- A container using supervisor to run nginx and consul-template, where consul-template polls for changes in the services registered to consul; consul-template reacts to changes by dynamically updating the nginx configuration in `/etc/nginx/conf.d` and reloading nginx

Build

- `cd ng-ct && ./build.sh && cd -`
- `cd svc && npm i && ./build.sh && cd -`

Run

- `./up.sh`
- `curl http://<ip>:8500/v1/catalog/services` should show that `svc` has registered with Consul
- `curl http://<ip>/svc/api` should show a welcome message in json, provided by the Express service. This shows that the Nginx reverse proxy configuration was auto-generated, and Nginx reloaded, in response to `svc` registration with Consul
- Verify previous step with `docker exec <webserverContainer> cat /etc/nginx/conf.d/auto.conf`
- `curl http://<ip>/svc/api/shutdown` should shut down the container, which includes deregistration
- Verify by checking Consul api for services
- Try hitting `http://<ip>/svc/api` again, should be 404
- Verify again by reviewing nginx conf with `cat` as above
- Restart `svc` with `./up.sh`, and review



## Relevant Docs

* https://github.com/hashicorp/consul-template
* https://www.consul.io/api/agent/service.html
* http://supervisord.org/configuration.html#program-x-section-settings
* https://github.com/hashicorp/consul-template/blob/master/examples/nginx.md
