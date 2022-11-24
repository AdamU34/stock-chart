import React, { useState, useEffect } from "react";
import Select from "react-select";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import "./App.css";

const apiKey: string = process.env.REACT_APP_API_KEY as string;

console.log({ apiKey });

const tickersURL = `http://api.marketstack.com/v1/tickers?access_key=${apiKey}`;
const eodURL = `http://api.marketstack.com/v1/eod?access_key=${apiKey}`;

interface SymbolOption {
  value: string;
  label: string;
}

const App = () => {
  const [selectedValue, setSelectedValue] = useState<SymbolOption>();
  const [symbols, setSymbols] = useState<SymbolOption[]>([]);
  const [results, setResults] = useState<any>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(tickersURL);
        const json = await res.json();
        setSymbols(
          json?.data?.map((el: any) => ({
            value: el?.name,
            label: el?.symbol,
          }))
        );
        setError(null);
      } catch (error: any) {
        setError(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedValue?.label) {
      const fetchData = async () => {
        try {
          const res = await fetch(
            `${eodURL}&symbols=${selectedValue?.label}&date_from=2000-10-10&date_to=2022-11-23`
          );
          const json = await res.json();
          setResults(json);
          setError(null);
        } catch (error: any) {
          setError(error);
        }
      };

      fetchData();
    }
  }, [selectedValue]);

  const handleChange = (val: any) => {
    setSelectedValue(val);
  };

  const options = {
    rangeSelector: {
      selected: 1,
    },
    title: {
      text: `${selectedValue?.label} Stock Price`,
    },
    series: [
      {
        name: selectedValue?.label,
        data: results?.data
          ?.reverse()
          ?.map((el: any) => [
            Date.UTC(
              Number(el?.date?.split("T")?.[0]?.split("-")?.[0]),
              Number(el?.date?.split("T")?.[0]?.split("-")?.[1]),
              Number(el?.date?.split("T")?.[0]?.split("-")?.[2])
            ),
            el?.close,
          ]),
        tooltip: {
          valueDecimals: 2,
        },
      },
    ],
  };

  return (
    <div className="App">
      <div className="Select">
        <Select
          className="basic-single"
          classNamePrefix="select"
          isDisabled={false}
          isLoading={false}
          isClearable={true}
          isRtl={false}
          isSearchable={true}
          options={symbols}
          onChange={handleChange}
        />
      </div>

      {selectedValue?.label && results?.data && symbols?.length && !error && (
        <div className="Chart">
          <HighchartsReact
            highcharts={Highcharts}
            constructorType={"stockChart"}
            options={options}
          />
        </div>
      )}
    </div>
  );
};

export default App;
