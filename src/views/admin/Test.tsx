import React from "react";
import Menu from "../../nodes/Menu";
import MenuItem from "../../nodes/MenuItem";
import Card from "../../nodes/Card";
import Wrapper from "../../nodes/Wrapper";
import Container from "../../nodes/Container";

export default function Test() {
  return (
    <>
      <Menu>
        <MenuItem to="#" children="Link" />
        <MenuItem to="#" children="Anchor" />
        <MenuItem to="#" children="Button" />
        <MenuItem to="#" children="URL" />
      </Menu>
      <Container>
        <Wrapper>
          <Card title="Test card" footer="My little footer">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. A
            accusantium cumque explicabo necessitatibus nulla provident
            recusandae vitae. Doloribus, exercitationem, ipsam, iusto laudantium
            odio quae quo quos rerum similique voluptatem voluptatum!
          </Card>
          <Card title="Test card" footer="My little footer">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda,
            atque dolore doloribus ducimus fugit itaque molestias natus nisi non
            possimus provident quia quo reiciendis ut vel! Consectetur nobis
            quia quod?
          </Card>
          <Card title="Test card" footer="My little footer">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. At
            consectetur deleniti distinctio error facilis impedit quaerat sunt!
            Alias blanditiis cupiditate dolores esse inventore labore natus
            provident qui quos voluptatem. Possimus.
          </Card>
        </Wrapper>
      </Container>
    </>
  );
}
