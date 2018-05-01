FROM nginx:1.13
RUN apt-get update -y && \
    apt-get install -y curl supervisor

# Install and extract consul-template executable
RUN mkdir -p /consul-template
RUN curl -L https://releases.hashicorp.com/consul-template/0.19.4/consul-template_0.19.4_linux_386.tgz -o /consul-template/ct.tar.gz

RUN cd /consul-template && \
    tar -zxf ct.tar.gz && \
    mv consul-template /usr/local/bin/consul-template && \
    rm -rf /consul-template

# Add consul template configuration and base templates
RUN mkdir /opt/template
COPY content/config.hcl       /opt/template/config.hcl
COPY content/nginx-conf.ctmpl   /opt/template/template.ctmpl

# Supervisord configuration
COPY content/supervisord.conf /etc/supervisor/conf.d/supervisord-template.conf
ENTRYPOINT [ "supervisord", "-n" ]
