export type JournalArticle = {
  slug: string;
  title: string;
  category: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  sections: Array<{ heading?: string; paragraphs: string[] }>;
};

export const journalArticles: JournalArticle[] = [
  {
    slug: "new-language-contemporary-african-menswear",
    title: "The New Language of Contemporary African Menswear",
    category: "Behind the Collections",
    subtitle: "How modern African tailoring can feel rooted, precise and relevant now.",
    image: "/brand/new-product-nb.png",
    imageAlt: "ỌNUỌRA contemporary African menswear",
    sections: [
      {
        paragraphs: [
          "I grew up in Nigeria in the 1990s, when much of what we considered fashionable seemed to come from somewhere else.",
          "Hip-hop culture shaped our music, television and dress. African clothing, by contrast, was often reserved for weddings, church or a school cultural day—then the next morning we returned to Western clothes.",
          "That was the contradiction: these garments represented where we came from, yet we treated them as something to dress up in rather than simply how we dressed.",
          "After leaving the continent, distance made me interrogate identity more deliberately. As I began the process Dr. Kamau Kambon calls re-Afrikanisation, clothing became part of that conversation."
        ]
      },
      {
        heading: "What We Wear Matters",
        paragraphs: [
          "There is an economic dimension to clothing that is easy to overlook. Every purchase decides whose creativity, labour and economy our money supports.",
          "If Africans consume only what others design and manufacture, we strengthen economies elsewhere while narrowing the possibilities within our own. Wearing African fashion therefore became more than an aesthetic choice for me; it became an expression of identity and an economic choice.",
          "That does not mean African design should be frozen in an imagined past. Culture evolves. The question is what contemporary African menswear looks like when it is made for the way we live now."
        ]
      },
      {
        heading: "Rooted, Without Being Restricted",
        paragraphs: [
          "ỌNUỌRA grew from that question. I wanted modern African clothing with a recognisable sensibility, without a wedding, ceremony or cultural occasion being required to justify it.",
          "It should work in Lagos, London or a New York summer. It should not become costume when it leaves the continent, nor become European in order to feel contemporary.",
          "Our objective is not to make African versions of European clothing. It is to develop a contemporary African design language of our own—refined, cultured and rooted.",
          "For me, that is the new language of African menswear. ỌNUỌRA is our contribution to it."
        ]
      }
    ]
  },
  {
    slug: "inside-making-onuora-outfit",
    title: "Inside the Making of an ỌNUỌRA Outfit",
    category: "African Craftsmanship",
    subtitle: "A closer look at proportion, construction, finishing and Nigerian authorship.",
    image: "/brand/new-product-b(back).png",
    imageAlt: "The construction of an ỌNUỌRA outfit",
    sections: [
      {
        paragraphs: [
          "Anyone who has commissioned clothing from a tailor understands the ritual: measurements, a fitting, an adjustment, then another return. With an established tailor the results can be extraordinary; without that understanding of the body, the process can be unpredictable.",
          "That experience shaped the way I thought about ỌNUỌRA. I wanted to retain what I love about African tailoring while solving one of its greatest barriers to scale: fit."
        ]
      },
      {
        heading: "Designing for Movement",
        paragraphs: [
          "Our approach begins with fabric. We deliberately seek materials with an element of stretch so an ỌNUỌRA garment can breathe and move with the person wearing it.",
          "Ready-to-wear African menswear should accommodate natural variation without requiring every customer to undergo an individual tailoring process. The trousers are cut with room to sit, walk and move while retaining a clean silhouette.",
          "The objective is simple: the precision of tailoring without the inconvenience traditionally associated with having something individually made."
        ]
      },
      {
        heading: "The Inside Matters Too",
        paragraphs: [
          "We have become increasingly uncompromising about finishing. A garment cannot simply photograph beautifully—turn it inside out, look at the seams, stitching, edges and the details the customer may never show anyone else.",
          "Quality is often found where nobody expects you to look. The inside of an ỌNUỌRA garment should meet the same standard we demand of the outside."
        ]
      },
      {
        heading: "Made Here",
        paragraphs: [
          "There is another principle at the centre of the house: we make in Africa. Our fabrics and components are sourced on the continent, and our garments are produced in Nigeria by African hands.",
          "This is not always the easiest approach. Manufacturing elsewhere can be faster, cheaper and easier to scale, but ỌNUỌRA exists partly because I believe Africans must demonstrate our capacity to do for self.",
          "If the house succeeds, it should create work, develop skills and circulate money here. It should show what Nigerian craftsmanship and African manufacturing can become when we demand increasingly high standards from ourselves.",
          "Every garment carries its place of origin: designed in Africa, sourced in Africa and made in Nigeria—with the intention of showing what is possible."
        ]
      }
    ]
  },
  {
    slug: "permanent-collections",
    title: "The Permanent Collections",
    category: "Campaigns",
    subtitle: "Three collections. One philosophy. A wardrobe designed for different occasions.",
    image: "/brand/products/original/aja/ajah-grid.png",
    imageAlt: "The ỌNUỌRA Permanent Collections",
    sections: [
      {
        paragraphs: [
          "ỌNUỌRA began with a silhouette I had been wearing for years: a V-neck, a clean line through the body and a three-quarter-length sleeve.",
          "It was influenced by the Nigerian menswear tradition sometimes described as Senator wear, but interpreted according to the way I wanted to dress. That silhouette became the foundation of the Heritage Collection."
        ]
      },
      {
        heading: "Heritage",
        paragraphs: [
          "Heritage remains perhaps the closest of the three collections to my personal style. Its V-neck and three-quarter sleeve create a distinctive proportion, while the cut follows the body without restricting it.",
          "The trousers retain a tailored appearance with room for movement. It was the beginning—and it led to another question: could the garment itself communicate more about Africa?"
        ]
      },
      {
        heading: "Cowrie",
        paragraphs: [
          "That question produced the Cowrie Collection. Across the African continent, cowries have served as currency, ornamentation and objects of cultural meaning; they also have a personal significance for me.",
          "Rather than importing another conventional button, we began incorporating three cowries into the garments themselves. The detail is subtle, but it gives a clean silhouette a conversation with it.",
          "Someone in Lagos may immediately understand the reference. Someone in London or New York may ask what they are. Culture travels."
        ]
      },
      {
        heading: "Resort",
        paragraphs: [
          "The Resort Collection takes the philosophy somewhere lighter and deliberately versatile. It is comfortable on the continent and equally natural during summer in Europe or America.",
          "African clothing should not require an African setting or a special occasion. People across the diaspora should simply be able to put it on."
        ]
      },
      {
        heading: "Three Collections. One Philosophy.",
        paragraphs: [
          "Heritage, Cowrie and Resort approach the wardrobe differently, but the philosophy underneath them is the same: African design does not need permission to be contemporary, and African craftsmanship does not need to be exported elsewhere before it can become excellent.",
          "African culture need not live only in museums, ceremonies or designated cultural days. We can wear it, manufacture it, develop it and build economies around it.",
          "It would be easier in some respects to manufacture ỌNUỌRA elsewhere, but moving production away from Africa whenever challenges arise never develops the capacity the continent needs. So we have chosen another path: to design here, make here, improve here and create garments capable of travelling anywhere in the world.",
          "Three collections. One philosophy. Refined. Cultured. Rooted."
        ]
      }
    ]
  }
];

export function getJournalArticle(slug: string) {
  return journalArticles.find((article) => article.slug === slug);
}
