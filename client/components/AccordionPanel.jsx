import React from 'react';
import { Panel } from 'react-bootstrap';

const AccordionPanel = ({ children, eventKey, title, currentKey, ...rest }) => (
  <Panel eventKey={eventKey} {...rest}>
    <Panel.Heading>
      <Panel.Title toggle>
        <i className={eventKey === currentKey ? 'fa fa-minus' : 'fa fa-plus'} /> {title}
      </Panel.Title>
    </Panel.Heading>
    <Panel.Body collapsible>{children}</Panel.Body>
  </Panel>
);

export default AccordionPanel;
