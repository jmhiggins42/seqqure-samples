import React from 'react';
import { PanelGroup } from 'react-bootstrap';

const Accordion = ({ children, activeKey, onSelect, ...rest }) => (
  <PanelGroup accordion activeKey={activeKey} onSelect={onSelect} {...rest}>
    {children}
  </PanelGroup>
);

export default Accordion;
