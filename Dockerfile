# Use light-weight Nginx alpine image
FROM nginx:alpine

# Copy all static web files into the default Nginx html serving folder
COPY . /usr/share/nginx/html

# Expose port 80 to access the web server
EXPOSE 80

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
