import React, { Component } from 'react';
import Papa from 'papaparse';

export class Store {

  load() {
    const get = (csv) => fetch(`http://localhost:9000/${csv}`)
      .then(resp => resp.text())
      .then(text => Papa.parse(text, { header: true, skipEmptyLines: true }).data);
    return Promise.all([
      get('books.csv'),
      get('authors.csv'),
      get('magazines.csv')
    ]).then(([books, authors, magazines]) => {
      let items = books.concat(magazines);
      items.sort((left, right) => left.title.localeCompare(right.title));
      items.forEach(item => item.authors = item.authors.split(',').map(author => authors.find(({ email }) => email === author)));
      return items;
    });
  }

}

export default class App extends Component {

  constructor(props) {
    super(props);
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
    this.handleFilterTypeChange = this.handleFilterTypeChange.bind(this);
    this.state = {
      items: [],
      filterText: '',
      filterType: filterType.email
    }
  }

  componentDidMount() {
    new Store().load().then(items => this.setState({ items }));
  }

  handleFilterTextChange(value) {
    this.setState({ filterText: value });
  }

  handleFilterTypeChange(value) {
    this.setState({ filterType: value });
  }

  render() {
    return (
      <div>
        <Filter
          filterText={this.state.filterText}
          filterType={this.state.filterType}
          onFilterTextChange={this.handleFilterTextChange}
          onFilterTypeChange={this.handleFilterTypeChange} />
        <List
          items={this.state.items}
          filterText={this.state.filterText}
          filterType={this.state.filterType} />
      </div>
    );
  }

}

const filterType = {
  isbn: 'isbn',
  email: 'email'
};

class Filter extends Component {

  constructor(props) {
    super(props);
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
    this.handleFilterTypeChange = this.handleFilterTypeChange.bind(this);
  }

  handleFilterTextChange(event) {
    this.props.onFilterTextChange(event.target.value);
  }

  handleFilterTypeChange(event) {
    this.props.onFilterTypeChange(event.target.value);
  }

  render() {
    return (
      <fieldset>
        <select
          defaultValue={this.props.filterType}
          // onChange={this.props.handleFilterTypeChange}
          >
          {Object.keys(filterType).map(type => <option key={type}>{type}</option>)}
        </select>
        <input type='text' defaultValue={this.props.filterText} onChange={this.handleFilterTextChange} />
      </fieldset>
    );
  }
}

class List extends Component {

  constructor(props) {
    super(props);
    this.filterItem = this.filterItem.bind(this);
  }

  render() {
    return (
      <ul>
        {this.props.items.filter(this.filterItem).map(item => <li key={item.isbn}>{item.title}</li>)}
      </ul>
    );
  }

  filterItem(item) {
    if (!this.props.filterText) {
      return true;
    }
    if (this.props.filterType === filterType.isbn) {
      return (item.isbn || '').indexOf(this.props.filterText) !== -1;
    } else if (this.props.filterType === filterType.email) {
      return item.authors.some(author => author.firstname.indexOf(this.props.filterText) !== -1 || author.lastname.indexOf(this.props.filterText) !== -1);
    }
    return false;
  }

}
