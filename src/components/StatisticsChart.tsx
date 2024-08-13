import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { CSVLink } from 'react-csv';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis
} from 'recharts';

interface StatisticsChartProps {
  statistics: Statistics;
}

function StatisticsChart({ statistics }: StatisticsChartProps) {
  // Set y-axis domain to at least (0,8)
  const yDomain = [0, Math.max(8, ...statistics.data.map((d) => d.nPeers))];
  const headers = [
    { label: 'timestamp', key: 'timestamp' },
    { label: 'nPeers', key: 'nPeers' }
  ];

  function dateFormatter(timestamp: number) {
    return new Date(timestamp).toLocaleDateString();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function customTooltip({ payload, label, active }: TooltipProps<number, string>) {
    const stats: StatisticData = payload?.[0]?.payload;

    if (!active && !stats) {
      return null;
    }

    return (
      <ul>
        <li>{`Number of peers: ${stats.nPeers}`}</li>
        <li>{`Timestamp: ${new Date(stats.timestamp).toLocaleTimeString()}`}</li>
      </ul>
    );
  }

  return (
    <>
      <Container>
        <Row>
          <h3>Server usage</h3>
        </Row>
        <Row className="py-3">
          <Col>
            <AreaChart
              width={600}
              height={300}
              data={statistics.data}
              margin={{ bottom: 20 }}
            >
              <defs>
                <linearGradient id="color-nPeers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#82ca9d" stopOpacity={0.85} />
                  <stop offset="90%" stopColor="#82ca9d" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={dateFormatter}>
                <Label value="Time" offset={0} position="bottom"></Label>
              </XAxis>
              <YAxis dataKey="nPeers" type="number" domain={yDomain}>
                <Label value="Number of Peers" angle={-90} position="center"></Label>
              </YAxis>
              <Tooltip content={customTooltip} />
              <Area
                type="monotone"
                dataKey="nPeers"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#color-nPeers)"
              ></Area>
            </AreaChart>
          </Col>
          <Col className="d-flex align-items-end justify-content-end">
            <CSVLink
              data={statistics.data}
              headers={headers}
              filename={`${statistics.id}.csv`}
              enclosingCharacter={''}
              separator={', '}
            >
              <Button variant="success">Download CSV</Button>
            </CSVLink>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default StatisticsChart;
