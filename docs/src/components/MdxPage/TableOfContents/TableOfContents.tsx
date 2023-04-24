import React, { useRef, useEffect, useState } from 'react';
import Slugger from 'github-slugger';
import { Link } from 'gatsby';
import { useLocation } from '@reach/router';
import useStyles from './TableOfContents.styles';

interface Heading {
  depth: number;
  value: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

function getActiveElement(rects: DOMRect[]) {
  if (rects.length === 0) {
    return -1;
  }

  for (let i = 0; i < rects.length; i++) {
    if (i < rects.length - 1) {
      if (rects[i + 1].y - 155 > 0) {
        return i;
      }
    } else {
      return i;
    }
  }
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const { classes, cx } = useStyles();
  const slugger = new Slugger();
  const [active, setActive] = useState(0);
  const { pathname } = useLocation();

  const slugs = useRef<HTMLDivElement[]>([]);
  const filteredHeadings = headings.filter((heading) => heading.depth <= 2);

  useEffect(() => {
    slugger.reset();
    slugs.current = filteredHeadings.map(
      (heading) => document.getElementById(slugger.slug(heading.value)) as HTMLDivElement
    );
  }, [filteredHeadings]);

  const handleScroll = () => {
    console.log('handle', slugs.current[0].getBoundingClientRect());
    setActive(getActiveElement(slugs.current.map((d) => d.getBoundingClientRect())));
  };

  useEffect(() => {
    setActive(getActiveElement(slugs.current.map((d) => d.getBoundingClientRect())));
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (filteredHeadings.length === 0) {
    return null;
  }

  const items = filteredHeadings.map((heading, index) => {
    const slug = slugger.slug(heading.value);
    return (
      <li className={cx({ selected: active === index })} key={heading.value}>
        <Link to={`${pathname}#${slug}`}>{heading.value}</Link>
      </li>
    );
  });

  return (
    <div className={cx(classes.root)}>
      <h4>Overview</h4>
      <ul>{items}</ul>
    </div>
  );
}
