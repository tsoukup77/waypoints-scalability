## Setup

### Install K6

[K6](https://k6.io/docs/) is load testing tool we will be using.

```
brew install k6
```

### Install Grafana and InfluxDB

We will use [Grafana](https://grafana.com/grafana/) for visualization of tests, InfluxDB is used as DB backend for tests. We will use [specific docker setup](https://k6.io/blog/k6-loves-grafana/) prepared for K6

```
git clone https://github.com/grafana/k6 && cd k6
git submodule update --init
docker-compose up -d influxdb grafana
```

### Install PM2

PM2 is [process manager for node.js](https://pm2.keymetrics.io/). We will use it to scale and monitor our installation.

```
sudo npm i -g pm2
```

## Workshop

### Step 1 - first load test

In this step we will create express server with endpoint with some trivial computation.
We will run load tests against the endpoint, explain parameters of the load test. We will observe Grafana.

Notes:

- create express app running on port 3300
- create /compute, `1e6` no-op for loop
- test with curl
  - `curl http://localhost:3300/compute`
- setup k6 test and test it with k6
  - `k6 run --vus 1 --duration 20s -e ENDPOINT=/compute perf.js`
  - explain vus, duration, etc.
- setup Grafana, [import dashboard id 2587](https://grafana.com/grafana/dashboards/2587)
- run k6 with influxdb
  - `k6 run --out influxdb=http://localhost:8086/k6 --vus 1 --duration 60s -e ENDPOINT=/compute perf.js`

### Step 2 - scaling server

In this step we will scale our web server up/down and observe results.

Notes:

- add pm2
  - `sudo npm i -g pm2`
  - `pm2 init`
  - edit config (rename)
  - `pm2 start`
- scale up/down with pm2 (cluster)
  - `pm2 scale waypoints 2`
- run long test and retest with load test
  - `k6 run --out influxdb=http://localhost:8086/k6 --vus 10 --duration 1200s -e ENDPOINT=/compute perf.js`
- explain the warm-up model

### Step 3 - compute hash

In this step we will create simple password-hash-as-a-service.

Notes:

- create password hash function at `/hash` based on [node:scrypt](https://nodejs.org/api/crypto.html#cryptoscryptsyncpassword-salt-keylen-options)
- test with k6, scale
  - `k6 run --vus 10 --duration 20s -e ENDPOINT=/hash perf.js`
- observe CPU via pm2
  - `pm2 monit`

### Step 4 - first bottleneck

We will observe first bottleneck and solve it.

Notes:

- scale back to 1 instance: `pm2 scale waypoints 1`
- run load test against compute and at the same time run hash, observe on Grafana
  - `k6 run --out influxdb=http://localhost:8086/k6 --vus 1 --duration 1200s -e ENDPOINT=/compute perf.js`
  - `k6 run --vus 1 --duration 20s -e ENDPOINT=/hash perf.js`
- identify bottleneck

### Step 5 - fix bottleneck

We will fix the bottleneck with async version of the function and explain why it helps.

- fix with async version
- observe result
- Node.js event loop model
- observe that CPU is the same as with sync version (1 vus)
- observe that with more vus, it scales to about 4x - why?
- increase UV_THREADPOOL_SIZE and observe

## K6 Usage

```
k6 run --vus 1 --duration 20s -e ENDPOINT=/test perf.js
k6 run --out influxdb=http://localhost:8086/k6 --vus 1 --duration 120s ENDPOINT=/test perf.js
```
